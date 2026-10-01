# LexiLearn - Frontend

Plataforma interactiva de apoyo al aprendizaje y lectoescritura con gamificación, ejercicios adaptativos, evaluaciones y panel para docentes.

## 🚀 Tecnologías Utilizadas

- **React 18**
- **Vite**
- **React Router Dom v6**
- **Axios** (Gestión de peticiones HTTP e interceptores JWT)
- **Vanilla CSS** (Sistema de diseño moderno, temas y animaciones)

## 📁 Estructura del Proyecto

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── components/       # Componentes reutilizables (Navbar, ProtectedRoute)
    ├── context/          # Estado global (AuthContext)
    ├── pages/            # Vistas principales (Dashboard, Exercise, Assessment, etc.)
    ├── services/         # Configuración de Axios y llamadas API
    ├── App.jsx           # Enrutamiento de la aplicación
    ├── index.css         # Estilos globales y tokens de diseño
    └── main.jsx          # Punto de entrada de la aplicación
```

## ⚙️ Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Compilar para producción:
   ```bash
   npm run build
   ```
