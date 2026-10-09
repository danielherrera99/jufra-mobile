import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const RegistrosMascotasAdminScreen = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  const fetchRegistros = async () => {
    try {
      const response = await api.get('/registros-mascotas');
      setRegistros(response.data.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los registros de mascotas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRegistros();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  const handleCheckboxChange = async (id, field, currentValue) => {
    try {
      const newValue = !currentValue;
      setRegistros(registros.map(r => r.id === id ? { ...r, [field]: newValue } : r));
      await api.put(`/registros-mascotas/${id}/servicios`, { [field]: newValue });
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el registro');
      fetchRegistros(); // revert
    }
  };

  const handleAprobar = async (id) => {
    Alert.alert(
      'Aprobar Registro',
      '¿Estás seguro de aprobar este registro? Una vez aprobado el usuario podrá descargar su certificado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Aprobar',
          onPress: async () => {
            try {
              await api.put(`/registros-mascotas/${id}/aprobar`);
              Alert.alert('Éxito', 'Registro aprobado correctamente');
              fetchRegistros();
            } catch (err) {
              Alert.alert('Error', 'No se pudo aprobar el registro');
            }
          }
        }
      ]
    );
  };

  const filteredRegistros = registros.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.idSolicitud && r.idSolicitud.toLowerCase().includes(term)) ||
      (r.nombreDueno && r.nombreDueno.toLowerCase().includes(term)) ||
      (r.nombreMascota && r.nombreMascota.toLowerCase().includes(term)) ||
      (r.whatsapp && r.whatsapp.toLowerCase().includes(term))
    );
  });

  const renderCheckbox = (label, value, onToggle) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <Ionicons 
        name={value ? "checkbox" : "square-outline"} 
        size={24} 
        color={value ? COLORS.primary : COLORS.gray} 
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.idSolicitud}>{item.idSolicitud}</Text>
        <View style={[styles.badge, { backgroundColor: item.estadoAprobado ? COLORS.success : COLORS.warning }]}>
          <Text style={styles.badgeText}>{item.estadoAprobado ? 'Aprobado' : 'Pendiente'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.infoText}><Text style={styles.bold}>Mascota:</Text> {item.nombreMascota}</Text>
        <Text style={styles.infoText}><Text style={styles.bold}>Dueño:</Text> {item.nombreDueno}</Text>
        <Text style={styles.infoText}><Text style={styles.bold}>WhatsApp:</Text> {item.whatsapp}</Text>
      </View>

      <View style={styles.serviciosContainer}>
        <Text style={styles.serviciosTitle}>Servicios:</Text>
        {renderCheckbox('Bendición', item.recibioBendicion, () => handleCheckboxChange(item.id, 'recibioBendicion', item.recibioBendicion))}
        {renderCheckbox('Vacuna', item.recibioVacuna, () => handleCheckboxChange(item.id, 'recibioVacuna', item.recibioVacuna))}
        {renderCheckbox('Desparasitación', item.recibioDesparasitacion, () => handleCheckboxChange(item.id, 'recibioDesparasitacion', item.recibioDesparasitacion))}
      </View>

      {!item.estadoAprobado && (
        <TouchableOpacity 
          style={styles.aprobarButton}
          onPress={() => handleAprobar(item.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
          <Text style={styles.aprobarButtonText}>Aprobar Registro</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesa de Atención</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, Mascota o Dueño..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRegistros}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No se encontraron registros</Text>
            </View>
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
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  idSolicitud: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    marginBottom: 2,
    color: COLORS.darkGray,
  },
  bold: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
  serviciosContainer: {
    backgroundColor: COLORS.lightGray + '40',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  serviciosTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.darkGray,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxLabel: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
  },
  aprobarButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  aprobarButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  }
});

export default RegistrosMascotasAdminScreen;
