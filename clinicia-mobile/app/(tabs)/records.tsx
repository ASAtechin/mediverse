import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, List, ActivityIndicator, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const fetchRecords = async (userId: string) => {
    if (!userId) return [];
    const { data } = await api.get(`/patient/records?patientId=${userId}`);
    return data;
};

export default function RecordsScreen() {
    const { user } = useAuth();

    const { data: records, isLoading } = useQuery({
        queryKey: ['records', user?.id],
        queryFn: () => fetchRecords(user?.id || ''),
        enabled: !!user?.id
    });

    if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Medical Records</Text>

            {records?.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 40, color: 'gray' }}>No records found.</Text>
            ) : (
                records?.map((visit: any) => (
                    <Card key={visit.id} style={styles.card}>
                        <Card.Title
                            title={format(new Date(visit.createdAt), 'PPP')}
                            subtitle={visit.appointment?.doctor?.name || 'Doctor Visit'}
                            left={(props) => <List.Icon {...props} icon="stethoscope" />}
                        />
                        <Card.Content>
                            <Text style={styles.label}>Diagnosis:</Text>
                            <Text style={styles.value}>{visit.diagnosis || 'None'}</Text>

                            <Divider style={{ marginVertical: 12 }} />

                            <Text style={styles.label}>Prescription:</Text>
                            {visit.prescriptions?.length > 0 ? (
                                visit.prescriptions.map((pres: any) => {
                                    let meds = [];
                                    try {
                                        meds = JSON.parse(pres.medications);
                                    } catch {
                                        return <Text key={pres.id} style={styles.value}>Unable to parse prescription data.</Text>;
                                    }
                                    return meds.map((m: any, idx: number) => (
                                        <View key={idx} style={styles.medRow}>
                                            <Text style={styles.medName}>• {m.medicine || m.name}</Text>
                                            <Text style={styles.medDose}>{m.dosage} - {m.frequency}</Text>
                                        </View>
                                    ));
                                })
                            ) : (
                                <Text style={styles.value}>No medications prescribed.</Text>
                            )}
                        </Card.Content>
                    </Card>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { marginBottom: 20, fontWeight: 'bold' },
    card: { marginBottom: 16, backgroundColor: 'white' },
    label: { fontWeight: 'bold', color: '#64748b', fontSize: 12 },
    value: { marginBottom: 4, color: '#0f172a' },
    medRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    medName: { fontWeight: '500' },
    medDose: { color: 'gray', fontSize: 12 }
});
