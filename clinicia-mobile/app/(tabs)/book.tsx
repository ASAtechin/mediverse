import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Button, Avatar, ActivityIndicator, useTheme, Chip, TextInput } from 'react-native-paper';
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
    const dateStr = date.toISOString();
    const { data } = await api.get(`/doctors/${doctorId}/slots?date=${dateStr}`);
    return data;
};

// Book appointment
const bookAppointment = async (payload: any) => {
    const { data } = await api.post('/patient/appointments', payload);
    return data;
};

const APPOINTMENT_TYPES = ['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY'];
const DATE_OPTIONS = [
    { key: 'today', label: 'Today', getDate: () => new Date() },
    { key: 'tomorrow', label: 'Tomorrow', getDate: () => addDays(new Date(), 1) },
    { key: 'day3', label: format(addDays(new Date(), 2), 'EEE, MMM d'), getDate: () => addDays(new Date(), 2) },
    { key: 'day4', label: format(addDays(new Date(), 3), 'EEE, MMM d'), getDate: () => addDays(new Date(), 3) },
    { key: 'day5', label: format(addDays(new Date(), 4), 'EEE, MMM d'), getDate: () => addDays(new Date(), 4) },
    { key: 'day6', label: format(addDays(new Date(), 5), 'EEE, MMM d'), getDate: () => addDays(new Date(), 5) },
    { key: 'day7', label: format(addDays(new Date(), 6), 'EEE, MMM d'), getDate: () => addDays(new Date(), 6) },
];

export default function BookScreen() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState('CONSULTATION');
    const [notes, setNotes] = useState('');

    const { data: doctors, isLoading: loadingDoctors } = useQuery({
        queryKey: ['doctors'],
        queryFn: fetchDoctors
    });

    const selectedDateOption = DATE_OPTIONS.find(d => d.key === selectedDateKey);
    const targetDate = selectedDateOption?.getDate() || new Date();

    const { data: slots, isLoading: loadingSlots } = useQuery({
        queryKey: ['slots', selectedDoctor, selectedDateKey],
        queryFn: () => fetchSlots(selectedDoctor!, targetDate),
        enabled: !!selectedDoctor && !!selectedDateKey
    });

    const mutation = useMutation({
        mutationFn: bookAppointment,
        onSuccess: () => {
            Alert.alert('Success', 'Appointment booked successfully!');
            queryClient.invalidateQueries({ queryKey: ['nextAppointment'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            router.replace('/(tabs)');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error || 'Failed to book appointment.';
            Alert.alert('Error', msg);
        }
    });

    const handleBook = () => {
        if (!selectedDoctor || !selectedDateKey || !selectedSlot || !user) return;

        const [hours, minutes] = selectedSlot.split(':').map(Number);
        const date = new Date(targetDate);
        date.setHours(hours, minutes, 0, 0);

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
            type: selectedType,
            notes: notes.trim() || undefined
        });
    };

    if (loadingDoctors) return <View style={styles.center}><ActivityIndicator /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Book Appointment</Text>

            {/* Step 1: Doctor */}
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
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text variant="titleMedium">{doc.name}</Text>
                                    {doc.specialization && (
                                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>{doc.specialization}</Text>
                                    )}
                                    <Text variant="bodySmall" style={{ color: 'gray' }}>{doc.clinic?.name}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Step 2: Date — 7 days */}
            <Text variant="titleMedium" style={styles.sectionTitle}>2. Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {DATE_OPTIONS.map((opt) => (
                    <Button
                        key={opt.key}
                        mode={selectedDateKey === opt.key ? 'contained' : 'outlined'}
                        onPress={() => { setSelectedDateKey(opt.key); setSelectedSlot(null); }}
                        style={styles.dateBtnWide}
                        compact
                    >
                        {opt.label}
                    </Button>
                ))}
            </ScrollView>

            {/* Step 3: Time slots */}
            {selectedDoctor && selectedDateKey && (
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

            {/* Step 4: Appointment type */}
            <Text variant="titleMedium" style={styles.sectionTitle}>4. Visit Type</Text>
            <View style={styles.slotsGrid}>
                {APPOINTMENT_TYPES.map((type) => (
                    <Chip
                        key={type}
                        mode="outlined"
                        selected={selectedType === type}
                        onPress={() => setSelectedType(type)}
                        style={styles.slotChip}
                        showSelectedOverlay
                    >
                        {type.replace('_', ' ')}
                    </Chip>
                ))}
            </View>

            {/* Notes */}
            <TextInput
                label="Reason / Notes (optional)"
                mode="outlined"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={{ marginTop: 16, backgroundColor: 'white' }}
            />

            <Button
                mode="contained"
                style={styles.bookBtn}
                contentStyle={{ paddingVertical: 8 }}
                disabled={!selectedDoctor || !selectedDateKey || !selectedSlot || mutation.isPending}
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
    docCard: { marginBottom: 8, backgroundColor: 'white', marginRight: 10, width: 280 },
    docContent: { flexDirection: 'row', alignItems: 'center' },
    dateBtnWide: { marginRight: 8, minWidth: 100 },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slotChip: { minWidth: 80, justifyContent: 'center' },
    bookBtn: { marginTop: 40, marginBottom: 40, borderRadius: 8 }
});
