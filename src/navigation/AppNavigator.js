import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import RecuperarPasswordScreen from '../screens/RecuperarPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import HermanosScreen from '../screens/HermanosScreen';
import AnunciosScreen from '../screens/AnunciosScreen';
import CrearAnuncioScreen from '../screens/CrearAnuncioScreen';
import EditarAnuncioScreen from '../screens/EditarAnuncioScreen';
import DetalleAnuncioScreen from '../screens/DetalleAnuncioScreen';
import EditarHermanoScreen from '../screens/EditarHermanoScreen';
import DetalleHermanoScreen from '../screens/DetalleHermanoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import AsistenciaScreen from '../screens/AsistenciaScreen';
import EscanearQRScreen from '../screens/EscanearQRScreen';
import RegistroAsistenciaManualScreen from '../screens/RegistroAsistenciaManualScreen';
import ReporteAsistenciaScreen from '../screens/ReporteAsistenciaScreen';
import ActasScreen from '../screens/ActasScreen';
import CrearActaScreen from '../screens/CrearActaScreen';
import DetalleActaScreen from '../screens/DetalleActaScreen';
import EditarActaScreen from '../screens/EditarActaScreen';
import FormacionScreen from '../screens/FormacionScreen';
import CrearFormacionScreen from '../screens/CrearFormacionScreen';
import DetalleFormacionScreen from '../screens/DetalleFormacionScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import CrearEventoScreen from '../screens/CrearEventoScreen';
import EditarEventoScreen from '../screens/EditarEventoScreen';
import MapaScreen from '../screens/MapaScreen';
import SeleccionarUbicacionScreen from '../screens/SeleccionarUbicacionScreen';
import CancioneroScreen from '../screens/CancioneroScreen';
import CrearCantoScreen from '../screens/CrearCantoScreen';
import EditarCantoScreen from '../screens/EditarCantoScreen';
import DetalleCantoScreen from '../screens/DetalleCantoScreen';
import PeticionesScreen from '../screens/PeticionesScreen';
import CrearPeticionScreen from '../screens/CrearPeticionScreen';
import DocumentosScreen from '../screens/DocumentosScreen';
import CrearDocumentoScreen from '../screens/CrearDocumentoScreen';
import DetalleDocumentoScreen from '../screens/DetalleDocumentoScreen';
import EditarDocumentoScreen from '../screens/EditarDocumentoScreen';
import EditarFormacionScreen from '../screens/EditarFormacionScreen';
import ConsejoScreen from '../screens/ConsejoScreen';
import EspiritualidadScreen from '../screens/EspiritualidadScreen';
import CrearEspiritualidadScreen from '../screens/CrearEspiritualidadScreen';
import GaleriaScreen from '../screens/GaleriaScreen';
import SubirFotoScreen from '../screens/SubirFotoScreen';
import DetalleFotoScreen from '../screens/DetalleFotoScreen';
import ServiciosScreen from '../screens/ServiciosScreen';
import CrearServicioScreen from '../screens/CrearServicioScreen';
import MensajesScreen from '../screens/MensajesScreen';
import ChatScreen from '../screens/ChatScreen';
import ComunicacionScreen from '../screens/ComunicacionScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import AdministracionWebScreen from '../screens/AdministracionWebScreen';
import AsistenteIAScreen from '../screens/AsistenteIAScreen';
import RedesSocialesScreen from '../screens/RedesSocialesScreen';
import AdministracionFraternidadScreen from '../screens/AdministracionFraternidadScreen';
import VidaEspiritualScreen from '../screens/VidaEspiritualScreen';
import MisRecursosScreen from '../screens/MisRecursosScreen';
import NovedadesScreen from '../screens/NovedadesScreen';
import VidaFraternaScreen from '../screens/VidaFraternaScreen';

import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { estaAutenticado, cargando } = useAuth();
    console.log('AppNavigator rendered - Bundle updated');

    if (cargando) {
        return null; // Aquí podrías mostrar un splash screen
    }

    return (
        <NavigationContainer>
            {!estaAutenticado ? (
                // Stack de autenticación
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: COLORS.white },
                    }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Registro" component={RegistroScreen} />
                    <Stack.Screen name="RecuperarPassword" component={RecuperarPasswordScreen} />
                </Stack.Navigator>
            ) : (
                // Stack principal
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: COLORS.cream },
                    }}
                >
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Anuncios" component={AnunciosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearAnuncio" component={CrearAnuncioScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarAnuncio" component={EditarAnuncioScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleAnuncio" component={DetalleAnuncioScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarHermano" component={EditarHermanoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleHermano" component={DetalleHermanoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Asistencia" component={AsistenciaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EscanearQR" component={EscanearQRScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="RegistroAsistenciaManual" component={RegistroAsistenciaManualScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ReporteAsistencia" component={ReporteAsistenciaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Actas" component={ActasScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearActa" component={CrearActaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleActa" component={DetalleActaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarActa" component={EditarActaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Formacion" component={FormacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearFormacion" component={CrearFormacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleFormacion" component={DetalleFormacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarFormacion" component={EditarFormacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Calendario" component={CalendarioScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Cancionero" component={CancioneroScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearCanto" component={CrearCantoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarCanto" component={EditarCantoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleCanto" component={DetalleCantoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Peticiones" component={PeticionesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearPeticion" component={CrearPeticionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Documentos" component={DocumentosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearDocumento" component={CrearDocumentoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleDocumento" component={DetalleDocumentoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarDocumento" component={EditarDocumentoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Consejo" component={ConsejoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Espiritualidad" component={EspiritualidadScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearEspiritualidad" component={CrearEspiritualidadScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Galeria" component={GaleriaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SubirFoto" component={SubirFotoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DetalleFoto" component={DetalleFotoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Servicios" component={ServiciosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CrearServicio" component={CrearServicioScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Mensajes" component={MensajesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AdministracionWeb" component={AdministracionWebScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AsistenteIA" component={AsistenteIAScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AdministracionFraternidad" component={AdministracionFraternidadScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="VidaEspiritual" component={VidaEspiritualScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MisRecursos" component={MisRecursosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Novedades" component={NovedadesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="VidaFraterna" component={VidaFraternaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="RedesSociales" component={RedesSocialesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Hermanos" component={HermanosScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditarEvento" component={EditarEventoScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Mapa" component={MapaScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SeleccionarUbicacion" component={SeleccionarUbicacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Comunicacion" component={ComunicacionScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Solicitudes" component={SolicitudesScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
