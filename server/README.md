## Setup

1. Set up your virtualenv: `virtualenv -p python3 venv`
2. Source the `activate` script: `source venv/bin/activate`
3. Install the dependencies in your virtualenv:
   `pip install -r requirements.txt`
4. Run the server `gunicorn app:app`
