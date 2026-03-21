# JUFRA Mobile App

Aplicación móvil para la gestión administrativa de la Juventud Franciscana (JUFRA).

## 🚀 Características

### Módulo: Jufra Admin
- ✅ **Base de Datos de Hermanos**: Fichas digitales con información completa
- ✅ **Control de Asistencia**: Escaneo QR y registro manual
- ✅ **Tesorería**: Gestión de ingresos, egresos y saldo en tiempo real
- ✅ **Actas**: Gestión de reuniones y seguimiento de acuerdos
- ✅ **Aniversarios**: Cálculo automático de fechas importantes
- ✅ **Modo Offline**: Funciona sin conexión y sincroniza automáticamente

## 📱 Plataformas

- ✅ Android
- ✅ iOS
- ✅ Web (opcional)

## 🎨 Diseño

Paleta de colores franciscana:
- **Marrón Franciscano** (#8B4513)
- **Dorado/Ocre** (#D4A574)
- **Verde Oliva** (#6B8E23)
- **Terracota** (#E07A5F)

## 🔧 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- Expo CLI
- Emulador Android/iOS o dispositivo físico

### Pasos

1. **Instalar dependencias**:
```bash
cd jufra-mobile
npm install
```

2. **Configurar la URL del backend**:
Edita `src/config/api.js` y actualiza la URL de tu API:
```javascript
const API_URL = 'http://TU_IP:5000/api';
```

3. **Iniciar la aplicación**:
```bash
# Desarrollo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📂 Estructura del Proyecto

```
jufra-mobile/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   ├── screens/          # Pantallas de la app
│   │   ├── LoginScreen.js
│   │   ├── RegistroScreen.js
│   │   ├── HomeScreen.js
│   │   └── HermanosScreen.js
│   ├── navigation/       # Configuración de navegación
│   │   └── AppNavigator.js
│   ├── context/          # Context API (estado global)
│   │   └── AuthContext.js
│   ├── config/           # Configuraciones
│   │   └── api.js
│   └── constants/        # Constantes y tema
│       └── theme.js
├── App.js               # Punto de entrada
└── package.json
```

## 🔐 Autenticación

La app utiliza JWT (JSON Web Tokens) para autenticación:
- Los tokens se almacenan en AsyncStorage
- Se renuevan automáticamente
- Logout automático si el token expira

## 📡 Conexión con el Backend

La app se conecta al backend mediante Axios:
- Interceptores para agregar tokens automáticamente
- Manejo de errores centralizado
- Retry automático en caso de fallo de red

## 🔄 Modo Offline

La aplicación funciona offline mediante:
- AsyncStorage para datos locales
- Cola de sincronización para operaciones pendientes
- Sincronización automática al recuperar conexión

## 🎯 Próximas Funcionalidades

- [ ] Módulo de Formación ("Camino de San Francisco")
- [ ] Módulo de Apostolado ("Manos Franciscanas")
- [ ] Red Social Jufista ("Conexión Tau")
- [ ] Notificaciones push
- [ ] Chat entre hermanos
- [ ] Calendario de eventos

## 📱 Instalación en Dispositivos

### Android (APK)
```bash
expo build:android
```

### iOS (App Store)
```bash
expo build:ios
```

## 🐛 Debugging

Para ver los logs en tiempo real:
```bash
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con 🕊️ para la JUFRA**
*"Paz y Bien"* - San Francisco de Asís
