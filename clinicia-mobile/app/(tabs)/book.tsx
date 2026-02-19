import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Avatar, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { format, addDays } from 'date-fns';

// Fetch doctors
const fetchDoctors = async () => {
    const { data } = await api.get('/doctors');
    return data;
};

// Fetch slots
const fetchSlots = async (doctorId: string, date: Date) => {
    if (!doctorId) return [];
    // API expects YYYY-MM-DD or ISO string
    const dateStr = date.toISOString();
    const { data } = await api.get(`/doctors/${doctorId}/slots?date=${dateStr}`);
    return data;
};

// Book appointment (using patient-facing API)
const bookAppointment = async (payload: any) => {
    const { data } = await api.post('/patient/appointments', payload);
    return data;
};

export default function BookScreen() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const { data: doctors, isLoading: loadingDoctors } = useQuery({
        queryKey: ['doctors'],
        queryFn: fetchDoctors
    });

    const targetDate = selectedDate === 'tomorrow' ? addDays(new Date(), 1) : new Date();

    const { data: slots, isLoading: loadingSlots } = useQuery({
        queryKey: ['slots', selectedDoctor, selectedDate],
        queryFn: () => fetchSlots(selectedDoctor!, targetDate),
        enabled: !!selectedDoctor && !!selectedDate
    });

    const mutation = useMutation({
        mutationFn: bookAppointment,
        onSuccess: () => {
            Alert.alert('Success', 'Appointment booked successfully!');
            queryClient.invalidateQueries({ queryKey: ['nextAppointment'] });
            router.replace('/(tabs)');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error || 'Failed to book appointment.';
            Alert.alert('Error', msg);
        }
    });

    const handleBook = () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot || !user) return;

        // Construct ISO date from selected slot (HH:mm)
        const [hours, minutes] = selectedSlot.split(':').map(Number);
        const date = new Date(targetDate);
        date.setHours(hours, minutes, 0, 0);

        // Find selected doctor to get clinicId
        const doc = doctors?.find((d: any) => d.id === selectedDoctor);

        if (!user.id) {
            Alert.alert('Error', 'Patient profile not found. Please log in again.');
            return;
        }

        if (!doc?.clinicId) {
            Alert.alert('Error', 'Doctor clinic information not available.');
            return;
        }

        mutation.mutate({
            doctorId: selectedDoctor,
            patientId: user.id,
            clinicId: doc.clinicId,
            date: date.toISOString(),
            type: 'CONSULTATION'
        });
    };

    if (loadingDoctors) return <View style={styles.center}><ActivityIndicator /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Book Appointment</Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>1. Select Doctor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizList}>
                {doctors?.map((doc: any) => (
                    <TouchableOpacity
                        key={doc.id}
                        onPress={() => { setSelectedDoctor(doc.id); setSelectedSlot(null); }}
                        activeOpacity={0.7}
                    >
                        <Card
                            style={[
                                styles.docCard,
                                selectedDoctor === doc.id && {
                                    borderColor: theme.colors.primary,
                                    borderWidth: 2,
                                    backgroundColor: theme.colors.primaryContainer
                                }
                            ]}
                        >
                            <Card.Content style={styles.docContent}>
                                <Avatar.Text size={40} label={doc.name.substring(0, 2)} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text variant="titleMedium">{doc.name}</Text>
                                    <Text variant="bodySmall" style={{ color: 'gray' }}>{doc.clinic?.name}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text variant="titleMedium" style={styles.sectionTitle}>2. Select Date</Text>
            <View style={styles.dateRow}>
                <Button
                    mode={selectedDate === 'today' ? 'contained' : 'outlined'}
                    onPress={() => { setSelectedDate('today'); setSelectedSlot(null); }}
                    style={styles.dateBtn}
                >
                    Today ({format(new Date(), 'MMM d')})
                </Button>
                <Button
                    mode={selectedDate === 'tomorrow' ? 'contained' : 'outlined'}
                    onPress={() => { setSelectedDate('tomorrow'); setSelectedSlot(null); }}
                    style={styles.dateBtn}
                >
                    Tomorrow ({format(addDays(new Date(), 1), 'MMM d')})
                </Button>
            </View>

            {selectedDoctor && selectedDate && (
                <>
                    <Text variant="titleMedium" style={styles.sectionTitle}>3. Select Time</Text>
                    {loadingSlots ? (
                        <ActivityIndicator style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
                    ) : (
                        <View style={styles.slotsGrid}>
                            {slots?.length > 0 ? slots.map((slot: string) => (
                                <Chip
                                    key={slot}
                                    mode="outlined"
                                    selected={selectedSlot === slot}
                                    onPress={() => setSelectedSlot(slot)}
                                    style={styles.slotChip}
                                    showSelectedOverlay
                                >
                                    {slot}
                                </Chip>
                            )) : (
                                <Text style={{ color: 'gray' }}>No available slots for this date.</Text>
                            )}
                        </View>
                    )}
                </>
            )}

            <Button
                mode="contained"
                style={styles.bookBtn}
                contentStyle={{ paddingVertical: 8 }}
                disabled={!selectedDoctor || !selectedDate || !selectedSlot || mutation.isPending}
                loading={mutation.isPending}
                onPress={handleBook}
            >
                Confirm Booking
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { marginBottom: 20, fontWeight: 'bold' },
    sectionTitle: { marginBottom: 12, marginTop: 10, fontWeight: '600' },
    horizList: { marginBottom: 12 },
    doctorList: { gap: 12 },
    docCard: { marginBottom: 8, backgroundColor: 'white', marginRight: 10, width: 280 },
    docContent: { flexDirection: 'row', alignItems: 'center' },
    dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    dateBtn: { flex: 1 },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slotChip: { minWidth: 80, justifyContent: 'center' },
    bookBtn: { marginTop: 40, marginBottom: 40, borderRadius: 8 }
});
