import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link, router } from 'expo-router';
import { format } from 'date-fns';

// Define types
interface Appointment {
  id: string;
  date: string;
  doctor?: { name: string };
  clinic?: { name: string };
}

// Fetch next appointment for the logged-in user
const fetchNextAppointment = async (userId: string): Promise<Appointment | null> => {
  if (!userId) return null;
  const { data } = await api.get(`/patient/appointments?patientId=${userId}`);
  // Assuming API sorts by date desc, we want the first future one. 
  // For prototype simplicity, just taking the first one received.
  return data.length > 0 ? data[0] : null;
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const { data: appointment, isLoading } = useQuery<Appointment | null>({
    queryKey: ['nextAppointment', user?.email], // use email as key
    queryFn: async () => {
      if (!user) return null;
      // Use the user.id from AuthContext (which comes from the Login API)
      return fetchNextAppointment(user.id);
    },
    enabled: !!user
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.greeting}>{new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'},</Text>
          <Text variant="titleLarge" style={styles.name}>{user?.name || 'Guest'}</Text>
        </View>
        <Avatar.Text size={48} label={(user?.name || 'G').substring(0, 2).toUpperCase()} />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.primary }}>Next Appointment</Text>
          {isLoading ? (
            <ActivityIndicator />
          ) : appointment ? (
            <View>
              <Text variant="titleLarge">{appointment.doctor?.name || 'Doctor'}</Text>
              <Text variant="bodyMedium">{format(new Date(appointment.date), 'PPP p')}</Text>
              <Text variant="bodySmall" style={{ marginTop: 4 }}>{appointment.clinic?.name}</Text>
            </View>
          ) : (
            <View>
              <Text variant="bodyLarge">No upcoming appointments.</Text>
              <Text variant="bodySmall" style={{ color: '#666' }}>Book a consultation to get started.</Text>
            </View>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => router.push('/book')}>Book Now</Button>
        </Card.Actions>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsGrid}>
        <Card style={styles.actionCard} onPress={() => router.push('/book')}>
          <Card.Content style={styles.actionContent}>
            <Avatar.Icon size={40} icon="calendar-plus" />
            <Text style={styles.actionText}>Book Visit</Text>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard} onPress={() => router.push('/records')}>
          <Card.Content style={styles.actionContent}>
            <Avatar.Icon size={40} icon="file-document" />
            <Text style={styles.actionText}>My Records</Text>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard} onPress={() => { }}>
          <Card.Content style={styles.actionContent}>
            <Avatar.Icon size={40} icon="pill" />
            <Text style={styles.actionText}>Meds</Text>
          </Card.Content>
        </Card>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    color: '#64748b',
  },
  name: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 24,
    backgroundColor: 'white',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionText: {
    marginTop: 8,
    fontWeight: '500',
    fontSize: 12,
  },
});
