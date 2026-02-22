import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, List, ActivityIndicator, Divider, Chip, Button, Portal, Modal } from 'react-native-paper';
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
    const [selectedVisit, setSelectedVisit] = useState<any>(null);

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
                    <TouchableOpacity key={visit.id} onPress={() => setSelectedVisit(visit)} activeOpacity={0.8}>
                        <Card style={styles.card}>
                            <Card.Title
                                title={format(new Date(visit.createdAt), 'PPP')}
                                subtitle={visit.appointment?.doctor?.name || 'Doctor Visit'}
                                left={(props) => <List.Icon {...props} icon="stethoscope" />}
                                right={() => (
                                    <Chip compact style={{ marginRight: 12 }}>
                                        {visit.appointment?.type || 'Visit'}
                                    </Chip>
                                )}
                            />
                            <Card.Content>
                                <Text style={styles.label}>Diagnosis:</Text>
                                <Text style={styles.value}>{visit.diagnosis || 'None'}</Text>

                                {visit.symptoms && (
                                    <>
                                        <Text style={[styles.label, { marginTop: 8 }]}>Symptoms:</Text>
                                        <Text style={styles.value}>{visit.symptoms}</Text>
                                    </>
                                )}

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
                            <Card.Actions>
                                <Button compact onPress={() => setSelectedVisit(visit)}>View Details</Button>
                            </Card.Actions>
                        </Card>
                    </TouchableOpacity>
                ))
            )}

            {/* Detail Modal */}
            <Portal>
                <Modal
                    visible={!!selectedVisit}
                    onDismiss={() => setSelectedVisit(null)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedVisit && (
                        <ScrollView>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                                Visit Details
                            </Text>

                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.detailValue}>{format(new Date(selectedVisit.createdAt), 'PPPp')}</Text>

                            <Text style={styles.label}>Doctor</Text>
                            <Text style={styles.detailValue}>{selectedVisit.appointment?.doctor?.name || 'N/A'}</Text>

                            <Text style={styles.label}>Diagnosis</Text>
                            <Text style={styles.detailValue}>{selectedVisit.diagnosis || 'N/A'}</Text>

                            <Text style={styles.label}>Symptoms</Text>
                            <Text style={styles.detailValue}>{selectedVisit.symptoms || 'N/A'}</Text>

                            <Text style={styles.label}>Notes / Plan</Text>
                            <Text style={styles.detailValue}>{selectedVisit.notes || 'N/A'}</Text>

                            {/* Vitals */}
                            {selectedVisit.vitals?.length > 0 && (
                                <>
                                    <Divider style={{ marginVertical: 12 }} />
                                    <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>Vitals</Text>
                                    {selectedVisit.vitals.map((v: any) => (
                                        <View key={v.id} style={styles.vitalsGrid}>
                                            {v.bpSystolic && <Chip compact>BP: {v.bpSystolic}/{v.bpDiastolic}</Chip>}
                                            {v.pulse && <Chip compact>Pulse: {v.pulse}</Chip>}
                                            {v.temperature && <Chip compact>Temp: {v.temperature}°F</Chip>}
                                            {v.weight && <Chip compact>Weight: {v.weight}kg</Chip>}
                                            {v.height && <Chip compact>Height: {v.height}cm</Chip>}
                                            {v.spo2 && <Chip compact>SpO2: {v.spo2}%</Chip>}
                                        </View>
                                    ))}
                                </>
                            )}

                            <Divider style={{ marginVertical: 12 }} />
                            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>Prescription</Text>
                            {selectedVisit.prescriptions?.length > 0 ? (
                                selectedVisit.prescriptions.map((pres: any) => {
                                    let meds = [];
                                    try { meds = JSON.parse(pres.medications); } catch { return null; }
                                    return meds.map((m: any, idx: number) => (
                                        <View key={idx} style={styles.medRow}>
                                            <Text style={styles.medName}>• {m.medicine || m.name}</Text>
                                            <Text style={styles.medDose}>{m.dosage} • {m.frequency} • {m.duration}</Text>
                                        </View>
                                    ));
                                })
                            ) : (
                                <Text style={{ color: 'gray' }}>No prescriptions</Text>
                            )}

                            <Button mode="outlined" onPress={() => setSelectedVisit(null)} style={{ marginTop: 20 }}>
                                Close
                            </Button>
                        </ScrollView>
                    )}
                </Modal>
            </Portal>
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
    medDose: { color: 'gray', fontSize: 12 },
    modal: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 16, maxHeight: '85%' },
    detailValue: { marginBottom: 12, color: '#0f172a', fontSize: 15 },
    vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }
});
