import subprocess, os

test_html = """<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; font-size: 16px; color: #0f172a; background: #ffffff; }
  </style>
</head>
<body>
  <h1>Hello world</h1>
  <p>Test</p>
</body>
</html>
"""

with open("test_font.html", "w") as f:
    f.write(test_html)

res = subprocess.run("npx impeccable detect test_font.html", shell=True, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Output:", res.stdout + res.stderr)
if os.path.exists("test_font.html"):
    os.remove("test_font.html")
