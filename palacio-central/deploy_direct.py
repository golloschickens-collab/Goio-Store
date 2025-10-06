#!/usr/bin/env python3
import subprocess
import sys
import time
import json

def deploy_to_host(ip, delay):
    """Deploy metrics system to a host"""
    print(f"🚀 Deploying to {ip} (delay: {delay})")
    
    # SSH command to setup metrics
    ssh_commands = [
        "apt update && apt install -y postgresql-client python3-pip",
        "mkdir -p /opt/metrics",
        "systemctl daemon-reload",
        "systemctl enable --now metrics-collector.timer",
        "systemctl status metrics-collector.timer --no-pager"
    ]
    
    for cmd in ssh_commands:
        try:
            print(f"  📋 Running: {cmd}")
            result = subprocess.run([
                "ssh", "-o", "StrictHostKeyChecking=no", 
                "-o", "ConnectTimeout=10",
                f"root@{ip}", cmd
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"  ✅ Success: {cmd[:50]}...")
            else:
                print(f"  ❌ Failed: {cmd[:50]}...")
                print(f"     Error: {result.stderr[:100]}")
        except Exception as e:
            print(f"  ❌ Exception: {e}")
    
    print(f"  ⏱️  Waiting {delay} before next deployment...\n")
    if delay.endswith('m'):
        time.sleep(int(delay[:-1]) * 60)
    else:
        time.sleep(int(delay))

def main():
    """Main deployment function"""
    hosts = [
        ("157.180.83.237", "2m"),
        ("78.156.195.120", "5m"), 
        ("91.98.36.86", "7m"),
        ("91.98.114.207", "9m")
    ]
    
    print("🎯 Starting Direct Metrics Deployment")
    print("=" * 50)
    
    for ip, delay in hosts:
        deploy_to_host(ip, delay)
    
    print("🎉 Deployment process completed!")

if __name__ == "__main__":
    main()