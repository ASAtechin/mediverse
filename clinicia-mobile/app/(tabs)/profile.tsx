import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Avatar, List } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={80} label={(user?.name || 'G').substring(0, 2).toUpperCase()} />
                <Text variant="headlineSmall" style={styles.name}>{user?.name || 'Guest User'}</Text>
                <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
            </View>

            <List.Section>
                <List.Subheader>Settings</List.Subheader>
                <List.Item
                    title="Notifications"
                    left={() => <List.Icon icon="bell" />}
                />
                <List.Item
                    title="Privacy & Security"
                    left={() => <List.Icon icon="shield-account" />}
                />
                <List.Item
                    title="Help & Support"
                    left={() => <List.Icon icon="help-circle" />}
                />
            </List.Section>

            <Button mode="outlined" onPress={logout} style={styles.logoutBtn} textColor="red">
                Log Out
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { alignItems: 'center', padding: 40, backgroundColor: 'white', marginBottom: 20 },
    name: { marginTop: 16, fontWeight: 'bold' },
    email: { color: 'gray' },
    logoutBtn: { margin: 20, borderColor: 'red' }
});
