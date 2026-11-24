from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    redirect,
    url_for,
    flash,
    Response
)
from flask_login import login_user, logout_user, login_required, current_user             #flask_login handles who is logged in with login_user/logout_user start and ends logins;
from project import create_app, db
from project.models import User, Find
import secrets                                                                            #secrets is making cryptographically strong values
from datetime import datetime, timedelta                                                  #datetime and timedelta handle times and durations
from project.outbound_mail import send_email                                              #send_email is function that talks to brevo for email service
import requests
#import math

app = create_app()


@app.route('/', methods=['GET'])
def home():
    return render_template('index2.html')

@app.route('/about', methods=['GET'])
def about():
    return jsonify({'message': 'About Us'})

@app.route('/contact', methods=['GET'])
def contact():
    return jsonify({'message': 'Contact Us'})

@app.route('/topo.html', methods=['GET'])
def topo():
    return render_template('topo.html')
'''@app.route('/topo2.html', methods=['GET'])
def topo2():
    return render_template('topo2.html')'''

#TEST TO BYPASS CORS POLICY RESTRICTION
# USGS's own TopoView /query endpoint returns 404, so we use Esri's public index of the
# same USGS historical topo maps instead. It has one layer per map scale.
HISTORICAL_INDEX = "https://historical1.arcgis.com/arcgis/rest/services/USA_Historical_Topo_Maps_Index/MapServer"
HISTORICAL_LAYERS = [4, 9, 10, 12, 15]   # 1:24,000  1:62,500  1:63,360  1:100,000  1:250,000

##LUIS##
'''def lon_lat_to_web_mercator(lon, lat):
    x = lon * 20037508.34 / 180

    y = math.log(
        math.tan(
            (90 + lat) * math.pi / 360
        )
    )

    y = y / (math.pi / 180)
    y = y * 20037508.34 / 180

    return x, y
    '''
##LUIS

def _query_layer(layer_id, lng, lat):
    params = {
        'where': '1=1',
        'geometry': f'{lng},{lat}',                  # ArcGIS wants longitude first
        'geometryType': 'esriGeometryPoint',
        'inSR': 4326,
        'spatialRel': 'esriSpatialRelIntersects',
        'outFields': '*',
        'returnGeometry': 'true',
        'outSR': 4326,
        'f': 'geojson',
    }
    r = requests.get(f'{HISTORICAL_INDEX}/{layer_id}/query', params=params,
                     headers={'User-Agent': 'Mozilla/5.0 (Potsherd)'}, timeout=15)
    r.raise_for_status()
    data = r.json()
    if 'error' in data:
        raise ValueError(str(data['error']))
    return data.get('features', [])

def _normalize(feature):
    p = feature.get('properties') or {}

    # If the service sent no usable shape, draw the sheet's bounding box instead.
    g = feature.get('geometry')
    if not g or not g.get('coordinates'):
        n, s, w, e = p.get('N_Lat'), p.get('S_Lat'), p.get('W_Long'), p.get('E_Long')
        if None not in (n, s, w, e):
            feature['geometry'] = {
                'type': 'Polygon',
                'coordinates': [[[w, s], [e, s], [e, n], [w, n], [w, s]]],
            }

    feature['properties'] = {
        'map_name':     p.get('Map_Name') or p.get('Name_1') or p.get('Map_Name1'),
        'imprint_year': p.get('Edit_Year'),
        'map_scale':    p.get('Map_Scale'),
        'scan_id':      p.get('Scan_ID1'),
        'drg_name':     p.get('File_name'),
    }
    return feature

'''
@app.route('/api/topoview-image', methods=['GET'])
def topoview_image():
    bbox_text = request.args.get('bbox')

    if not bbox_text:
        return jsonify({
            'error': 'bbox is required'
        }), 400

    try:
        west, south, east, north = map(
            float,
            bbox_text.split(',')
        )

        southwest = lon_lat_to_web_mercator(
            west,
            south
        )

        northeast = lon_lat_to_web_mercator(
            east,
            north
        )

        bbox_3857 = ",".join([
            str(southwest[0]),
            str(southwest[1]),
            str(northeast[0]),
            str(northeast[1])
        ])

        params = {
            'bbox': bbox_3857,
            'bboxSR': '3857',
            'imageSR': '3857',
            'size': '1200,800',
            'format': 'png32',
            'transparent': 'true',

            # Display the historical-map index layers
            'layers': 'show:' + ','.join(
                str(layer_id)
                for layer_id in HISTORICAL_LAYERS
            ),

            'f': 'image'
        }

        usgs_response = requests.get(
            f'{HISTORICAL_INDEX}/export',
            params=params,
            headers={
                'User-Agent': 'Mozilla/5.0 (Potsherd)'
            },
            timeout=30
        )

        content_type = usgs_response.headers.get(
            'Content-Type',
            ''
        )

        if usgs_response.status_code != 200:
            print(
                'TopoView image request failed:',
                usgs_response.status_code,
                usgs_response.text[:500]
            )

        return Response(
            usgs_response.content,
            status=usgs_response.status_code,
            content_type=content_type or 'image/png'
        )

    except ValueError:
        return jsonify({
            'error':
                'bbox must contain four numbers: ' +
                'west,south,east,north'
        }), 400

    except Exception as error:
        print(
            'TopoView image proxy error:',
            repr(error)
        )

        return jsonify({
            'error': str(error)
        }), 500
'''
##DAVID FIX BELOW##
@app.route('/api/topoview', methods=['GET'])
def topoview():
    try:
        lat = float(request.args['lat'])
        lng = float(request.args['lng'])
    except (KeyError, ValueError):
        return jsonify({'error': 'lat and lng are required numbers'}), 400

    features, errors = [], []
    for layer_id in HISTORICAL_LAYERS:
        try:
            features += [_normalize(f) for f in _query_layer(layer_id, lng, lat)]
            print("TOPOVIEW OK: layer", layer_id)
        except (requests.RequestException, ValueError) as e:
            print("TOPOVIEW FAILED: layer", layer_id, "->", repr(e))
            errors.append(f"layer {layer_id}: {e}")

    if not features and len(errors) == len(HISTORICAL_LAYERS):
        return jsonify({'error': 'Historical topo index unavailable', 'details': errors}), 502

    # newest first, so the info panel (which shows features[0]) shows the latest edition
    features.sort(key=lambda f: f['properties'].get('imprint_year') or 0, reverse=True)
    return jsonify({'type': 'FeatureCollection', 'features': features})
#TEST TO BYPASS CORS POLICY RESTRICTION

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        email = request.form['email'].strip().lower()
        password = request.form['password']

        if not username or not email or not password:
            flash('All fields are required.')
            return render_template('register.html')

        existing = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing:
            flash('That username or email is already in use.')
            return render_template('register.html')

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            flash('Invalid username or password.')
            return redirect(url_for('home'))

        login_user(user)
        return redirect(url_for('home'))

    return render_template('login.html')

# @app.route('/forgot-password', methods=['GET', 'POST'])
# def forgot_password():
#     if request.method == 'POST':
#         email = request.form['email'].strip().lower()
#         user = User.query.filter_by(email=email).first()

#         # Same message whether or not the email exists, so this page can't
#         # be used to check which emails are registered
#         if user:
#             token = user.generate_reset_token()
#             db.session.commit()

#             # "Sending the email" — for now this just prints the link to
#             # your terminal. Swap this out for a real email service later.
#             reset_url = url_for('reset_password', token=token, _external=True)
#             print(f'\nPASSWORD RESET LINK for {user.email}:\n{reset_url}\n')

#         flash('If that email is registered, a reset link has been sent.')
#         return render_template('forgot_password.html')

#     return render_template('forgot_password.html')

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        if user:
            user.reset_token = secrets.token_urlsafe(32)
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            link = url_for('reset_password', token=user.reset_token, _external=True)
            try:
                send_email(user.email, 'Reset your Potsherd password',
                           f'<p>Click to reset your password (valid 1 hour):</p><p><a href="{link}">{link}</a></p>',
                           f'Reset your password (valid 1 hour): {link}')
            except Exception:
                app.logger.exception('reset email failed')
        # same message whether or not the email exists, so nobody can probe for accounts
        flash('If that email is registered, a reset link has been sent.')
        return redirect(url_for('login'))
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    user = User.query.filter_by(reset_token=token).first()

    if user is None or not user.verify_reset_token(token):
        flash('That reset link is invalid or has expired.')
        return redirect(url_for('forgot_password'))

    if request.method == 'POST':
        password = request.form['password']
        confirm = request.form['confirm_password']

        if password != confirm:
            flash('Passwords do not match.')
            return render_template('reset_password.html', token=token)

        if len(password) < 8:
            flash('Password must be at least 8 characters.')
            return render_template('reset_password.html', token=token)

        user.set_password(password)
        user.clear_reset_token()
        db.session.commit()
        flash('Your password has been reset. You can log in now.')
        return redirect(url_for('login'))

    return render_template('reset_password.html', token=token)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/api/finds', methods=['GET'])
def get_finds():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Login required'}), 401

    finds = Find.query.filter_by(user_id=current_user.id).order_by(Find.id.desc()).all()
    return jsonify([
        {'id': f.id, 'latitude': float(f.latitude),
         'longitude': float(f.longitude), 'label': f.label}
        for f in finds
    ])


@app.route('/api/finds', methods=['POST'])
def add_find():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Login required'}), 401

    data = request.get_json(silent=True) or {}
    try:
        lat = float(data['latitude'])
        lon = float(data['longitude'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'Latitude and longitude must be numbers.'}), 400

    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return jsonify({'error': 'Coordinates out of range.'}), 400

    label = (data.get('label') or '').strip()[:200]
    find = Find(user_id=current_user.id, latitude=lat, longitude=lon, label=label or None)
    db.session.add(find)
    db.session.commit()
    return jsonify({'id': find.id, 'latitude': lat, 'longitude': lon}), 201

if __name__ == '__main__':
    app.run(debug=True)
