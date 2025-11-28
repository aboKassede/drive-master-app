# AWS Security Group Rules for Driving School Platform

## Required Inbound Rules:

| Port | Protocol | Source | Description |
|------|----------|---------|-------------|
| 22 | TCP | 0.0.0.0/0 | SSH access |
| 8000 | TCP | 0.0.0.0/0 | Backend API |
| 27017 | TCP | 0.0.0.0/0 | MongoDB (restrict in production) |
| 80 | TCP | 0.0.0.0/0 | HTTP (optional) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (optional) |

## Outbound Rules:
- All traffic (0.0.0.0/0) on all ports

## AWS Console Steps:

1. **Create Security Group:**
   - Go to EC2 → Security Groups → Create Security Group
   - Name: `driving-school-sg`
   - Description: `Security group for Driving School Platform`

2. **Add Inbound Rules:**
   ```
   SSH: Port 22, Source: 0.0.0.0/0
   Custom TCP: Port 8000, Source: 0.0.0.0/0
   Custom TCP: Port 27017, Source: 0.0.0.0/0
   HTTP: Port 80, Source: 0.0.0.0/0
   HTTPS: Port 443, Source: 0.0.0.0/0
   ```

3. **Outbound Rules:**
   - Keep default (All traffic allowed)

## Production Security Notes:
- Restrict SSH (port 22) to your IP only
- Restrict MongoDB (port 27017) to VPC CIDR only
- Use Application Load Balancer for HTTPS termination