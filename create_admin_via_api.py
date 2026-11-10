#!/usr/bin/env python
"""Create admin user via API"""

import requests
import json

url = 'http://localhost:8000/api/auth/register'
data = {
    'email': 'admin@gamit.edu',
    'password': 'admin123',
    'full_name': 'Admin User',
    'role': 'admin'
}

try:
    response = requests.post(url, json=data)
    if response.status_code == 201:
        print('[OK] Admin user created successfully!')
        result = response.json()
        print(f'Email: admin@gamit.edu')
        print(f'Password: admin123')
        print(f'Role: admin')
    elif response.status_code == 400:
        print('[INFO] Admin user already exists')
    else:
        print(f'[ERROR] Status {response.status_code}: {response.text}')
except Exception as e:
    print(f'[ERROR] Failed to connect to API: {e}')
    print('Make sure the backend is running on http://localhost:8000')
