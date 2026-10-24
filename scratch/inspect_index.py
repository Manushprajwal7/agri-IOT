import subprocess

res = subprocess.run("npx impeccable detect index.html", shell=True, capture_output=True, text=True)
print("=== DETECT INDEX.HTML ===")
print(res.stdout)
print(res.stderr)
