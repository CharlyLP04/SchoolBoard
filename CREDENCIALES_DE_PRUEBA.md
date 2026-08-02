# 🔑 Credenciales de Prueba — SchoolBoard MVP

Para evaluar y probar la aplicación en tu entorno local o en producción, puedes acceder inmediatamente al sistema utilizando la cuenta de Administrador principal, la cual es generada de forma automática al iniciar el backend:

---

## 🛡️ Cuenta Principal (Administrador)
* **Correo electrónico:** `admin@schoolboard.com`
* **Contraseña:** `admin123`
* **Rol:** Administrador del Sistema / Líder de Proyecto

---

## 👥 Cuentas de Colaboradores y Estudiantes
Además del acceso administrativo predeterminado, la plataforma cuenta con un sistema real de autenticación mediante JWT (JSON Web Tokens). 

1. Puedes dirigirte a la opción de **"Crear una nueva cuenta" / Registro** en la pantalla de inicio para registrar a nuevos usuarios en tiempo real.
2. Cada nuevo usuario podrá crear sus propios **Espacios de Trabajo**, gestionar equipos y colaborar en el Tablero Kanban del sistema.

---

## 💡 Instrucciones rápidas de acceso local:
1. Asegúrate de tener el servidor backend en ejecución en el puerto `5000` (`cd server && npm run dev`).
2. Con el frontend corriendo en el puerto `5173` (`npm run dev` en la raíz), abre `http://localhost:5173` en tu navegador.
3. Introduce el correo y contraseña señalados arriba para iniciar sesión inmediatamente.
