const { exec } = require('child_process');

const PORT = 5002;

const command = process.platform === 'win32' 
    ? `netstat -ano | findstr :${PORT}`
    : `lsof -i :${PORT}`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`No process found using port ${PORT}`);
        return;
    }

    if (process.platform === 'win32') {
        // Parse Windows output
        const lines = stdout.split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 4) {
                const pid = parts[parts.length - 1];
                if (pid && !isNaN(pid)) {
                    exec(`taskkill /F /PID ${pid}`, (err) => {
                        if (err) {
                            console.error(`Failed to kill process ${pid}`);
                        } else {
                            console.log(`Successfully killed process ${pid}`);
                        }
                    });
                }
            }
        }
    } else {
        // Parse Unix output
        const lines = stdout.split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 1) {
                const pid = parts[1];
                if (pid && !isNaN(pid)) {
                    exec(`kill -9 ${pid}`, (err) => {
                        if (err) {
                            console.error(`Failed to kill process ${pid}`);
                        } else {
                            console.log(`Successfully killed process ${pid}`);
                        }
                    });
                }
            }
        }
    }
});