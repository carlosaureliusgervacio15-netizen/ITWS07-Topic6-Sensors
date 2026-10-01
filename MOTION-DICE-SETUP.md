
# Motion Dice

This project uses:
- Ionic Angular
- Capacitor Motion sensor
- Shake sensitivity from 1 to 10
- A six-sided dice roller
- A small Node.js REST API

## Run the API

From the project folder:

```powershell
node api-server.js
```

Keep this terminal open.

## Run Ionic over the local network

Open another terminal:

```powershell
npm.cmd start -- --host 0.0.0.0
```

Then find your PC IPv4 address with:

```powershell
ipconfig
```

On your phone, open:

```text
http://YOUR-PC-IP:4200
```

The app automatically uses the same IP for the API on port 3000.

Example:

```text
Ionic: http://192.168.1.10:4200
API:   http://192.168.1.10:3000/api
```

Make sure the phone and PC are connected to the same Wi-Fi.

If Windows Firewall asks about Node.js, allow access on Private networks.
