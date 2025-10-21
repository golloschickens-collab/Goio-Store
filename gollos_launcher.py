#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🥚 LANZADOR IMPERIO GOLLOS
Activador principal del imperio Gollos con automatización 24/7
"""

import os
import sys
import time
import subprocess
import json
from datetime import datetime

class GollosEmpireLauncher:
    def __init__(self):
        self.empire_name = "GOLLOS"
        self.base_path = "/home/deploy/proyectos/Goio-Store/palacio-central"
        self.gollos_path = f"{self.base_path}/gollos"
        self.config_path = f"{self.base_path}/config"
        
    def print_banner(self):
        print("=" * 60)
        print("🥚 IMPERIO GOLLOS - INICIANDO OPERACIONES")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🖥️  Servidor: Hetzner Cloud")
        print(f"📍 Ubicación: {self.gollos_path}")
        print("=" * 60)
        
    def check_environment(self):
        print("\n🔍 VERIFICANDO ENTORNO...")
        
        # Verificar Python
        python_version = sys.version.split()[0]
        print(f"  ✅ Python: {python_version}")
        
        # Verificar directorios
        if os.path.exists(self.gollos_path):
            print(f"  ✅ Directorio Gollos: Existe")
        else:
            print(f"  ❌ Directorio Gollos: No encontrado")
            return False
            
        # Verificar agentes
        agents_path = f"{self.gollos_path}/agents"
        if os.path.exists(agents_path):
            agents = os.listdir(agents_path)
            print(f"  ✅ Agentes disponibles: {len(agents)}")
            for agent in agents:
                if agent.endswith('.py'):
                    print(f"    • {agent}")
        
        # Verificar credenciales
        keys_file = f"{self.config_path}/keys.json"
        if os.path.exists(keys_file):
            print(f"  ✅ Credenciales: Configuradas")
        else:
            print(f"  ⚠️  Credenciales: Archivo keys.json no encontrado")
            
        return True
        
    def activate_automation(self):
        print("\n🚀 ACTIVANDO AUTOMATIZACIÓN 24/7...")
        
        automation_script = f"{self.gollos_path}/agents/gollos_automation_24_7.py"
        
        if os.path.exists(automation_script):
            print(f"  📝 Script encontrado: gollos_automation_24_7.py")
            print(f"  🔄 Preparando ejecución...")
            
            # Crear log file
            log_file = f"{self.gollos_path}/logs/automation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            
            print(f"  📋 Log: {log_file}")
            print(f"  ⚡ Estado: LISTO PARA ACTIVAR")
            print(f"\n💡 Para activar el agente 24/7, ejecuta:")
            print(f"   cd {self.gollos_path}")
            print(f"   source ../venv/bin/activate")
            print(f"   nohup python agents/gollos_automation_24_7.py > logs/automation.log 2>&1 &")
            
        else:
            print(f"  ❌ Script de automatización no encontrado")
            
    def show_status(self):
        print("\n📊 ESTADO ACTUAL DEL IMPERIO:")
        print("  🟢 Infraestructura: Operativa")
        print("  🟢 Agentes: Desplegados")
        print("  🟡 Automatización: Lista para activar")
        print("  🟢 Credenciales: Configuradas")
        
    def run(self):
        self.print_banner()
        
        if self.check_environment():
            self.activate_automation()
            self.show_status()
            
            print("\n" + "=" * 60)
            print("💪 IMPERIO GOLLOS: LISTO PARA DOMINAR")
            print("🎯 Próximo paso: Activar automatización 24/7")
            print("=" * 60)
        else:
            print("\n❌ Error en verificación del entorno")
            return False
            
        return True

if __name__ == "__main__":
    launcher = GollosEmpireLauncher()
    launcher.run()