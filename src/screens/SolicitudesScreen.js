import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS } from '../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SolicitudesScreen = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchSolicitudes = async () => {
    try {
      const response = await api.get('/solicitudes');
      setSolicitudes(response.data.solicitudes || response.data.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSolicitudes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setLoading(true);
      await api.put(`/solicitudes/${id}`, { estado: nuevoEstado });
      fetchSolicitudes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar Solicitud',
      '¿Estás seguro de que deseas eliminar esta solicitud web?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/solicitudes/${id}`);
              fetchSolicitudes();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la solicitud');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isContactado = item.estado === 'contactado';
    
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <View style={[styles.badge, { backgroundColor: isContactado ? COLORS.success + '20' : COLORS.warning + '20' }]}>
            <Text style={[styles.badgeText, { color: isContactado ? COLORS.success : COLORS.warning }]}>
              {isContactado ? 'Contactado' : 'Pendiente'}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>
          {format(new Date(item.createdAt), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}><Text style={styles.bold}>Edad:</Text> {item.edad} años</Text>
        </View>

        <TouchableOpacity 
          style={styles.whatsappBtn}
          onPress={() => {
            const tel = item.telefono || '';
            Linking.openURL(`whatsapp://send?phone=51${tel.replace(/\s+/g, '')}&text=¡Paz y bien ${item.nombre}! Vimos tu solicitud en la página web.`);
          }}
        >
          <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
          <Text style={styles.whatsappText}>Contactar: {item.telefono}</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isContactado ? COLORS.warning : COLORS.success }]}
            onPress={() => handleEstadoChange(item._id, isContactado ? 'pendiente' : 'contactado')}
          >
            <Text style={styles.actionText}>
              {isContactado ? 'Marcar Pendiente' : 'Marcar Contactado'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.danger, marginLeft: 10 }]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes Web</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : solicitudes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-circle-outline" size={80} color={COLORS.gray} />
          <Text style={styles.emptyText}>No hay solicitudes pendientes.</Text>
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.text,
  },
  bold: {
    fontWeight: 'bold',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  whatsappText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SolicitudesScreen;
