#!/bin/bash

echo "🏄‍♂️ Starting Surf School Booking Platform..."
echo "=============================================="

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Service Status:"
echo "=================="
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo "🗄️ Database: localhost:5432"
echo ""
echo "👥 Test Users:"
echo "- Admin: admin@surfschool.com / admin123"
echo "- School: school@surfschool.com / school123"
echo "- Instructor: instructor@surfschool.com / instructor123"
echo "- Student: student@surfschool.com / student123"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"