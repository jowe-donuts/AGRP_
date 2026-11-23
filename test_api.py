import requests

# Test items endpoint
r = requests.get('http://localhost:8000/api/items/?size=3')
items = r.json()
print(f'Items endpoint: {r.status_code}')
print(f'Items count: {len(items)}')
if items:
    i = items[0]
    print(f'First item: id={i["id"]}, title={i["title"]}, status={i["status"]}, category={i["category"]}')

# Test health
r2 = requests.get('http://localhost:8000/')
print(f'\nHealth: {r2.json()}')
