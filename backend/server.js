const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Create Express app
const app = express();

// CORS configuration with more permissive settings for development
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://localhost:8081','https://bloodsetu.netlify.app/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Blood Bank Management System API' });
});

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

// Verify MongoDB URI format
if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is not defined in .env file');
    process.exit(1);
}

// Set up connection event listeners before connecting
mongoose.connection.on('connecting', () => {
    console.log('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Attempt to connect
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
})
.then(() => {
    // Verify the connection is actually established
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not established');
    }
    console.log('MongoDB connection verified');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        codeName: err.codeName
    });
    process.exit(1);
});

// Routes
console.log('Registering routes...');

app.use('/api/auth', require('./routes/auth'));
console.log('Auth routes registered');

app.use('/api/admin', require('./routes/admin'));
console.log('Admin routes registered');

app.use('/api/donor', require('./routes/donor'));
console.log('Donor routes registered');

app.use('/api/hospital', require('./routes/hospital'));
console.log('Hospital routes registered');

app.use('/api/feedback', require('./routes/feedback'));
console.log('Feedback routes registered');

app.use('/api/bloodcamp', require('./routes/bloodCamp'));
console.log('Blood Camp routes registered');

// Log all incoming requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        headers: {
            authorization: req.headers.authorization ? 'Present' : 'Not present',
            'content-type': req.headers['content-type']
        }
    });
    next();
});

// Simple route to check if admin routes are loaded
app.get('/api/check-admin-routes', (req, res) => {
    try {
        const adminRoutes = require('./routes/admin');
        const routeNames = [];
        adminRoutes.stack?.forEach(layer => {
            if (layer.route) {
                routeNames.push(`${layer.route.stack[0].method.toUpperCase()} ${layer.route.path}`);
            }
        });
        res.json({ 
            message: 'Admin routes check', 
            loaded: true,
            routes: routeNames.length > 0 ? routeNames : 'No routes found'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error checking admin routes',
            error: error.message,
            stack: error.stack
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler - This should be the last middleware
app.use((req, res) => {
    console.log('404 - Route not found:', {
        path: req.path,
        method: req.method,
        headers: req.headers
    });
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Import blood camp scheduler
const { updateBloodCampStatus } = require('./jobs/bloodCampScheduler');

// Only start the server if MongoDB is connected
const startServer = () => {
    const PORT = process.env.PORT || 5002;
    try {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Test the server at http://localhost:${PORT}/api/test`);
            console.log(`Check admin routes at http://localhost:${PORT}/api/check-admin-routes`);
            
            // Run the blood camp status update job immediately on server start
            updateBloodCampStatus()
                .then(result => {
                    console.log(`Initial blood camp status update completed: ${result.updatedCount} camps updated`);
                })
                .catch(err => {
                    console.error('Error in initial blood camp status update:', err);
                });
            
            // Schedule the blood camp status update job to run every hour
            setInterval(() => {
                updateBloodCampStatus()
                    .then(result => {
                        console.log(`Scheduled blood camp status update completed: ${result.updatedCount} camps updated`);
                    })
                    .catch(err => {
                        console.error('Error in scheduled blood camp status update:', err);
                    });
            }, 60 * 60 * 1000); // Run every hour (60 minutes * 60 seconds * 1000 milliseconds)
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed.');
                mongoose.connection.close(false).then(() => {
                    console.log('MongoDB connection closed.');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Wait for MongoDB connection before starting server
mongoose.connection.once('connected', startServer);