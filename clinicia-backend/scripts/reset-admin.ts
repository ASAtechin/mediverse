import { firebaseAdmin } from '../src/lib/firebase';

async function resetPassword() {
    const email = 'admin@clinicia.com';
    const newPassword = 'Admin@123';

    try {
        console.log(`🔍 Looking for user: ${email}`);
        let user;
        try {
            user = await firebaseAdmin.auth().getUserByEmail(email);
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                console.log('⚠️ User not found. Creating new Super Admin user...');
                user = await firebaseAdmin.auth().createUser({
                    email,
                    password: newPassword,
                    displayName: 'Super Admin',
                    uid: 'super_admin_uid_123'
                });
                console.log('✅ User created successfully.');
                return;
            }
            throw e;
        }

        console.log(`✅ User found (UID: ${user.uid}). Updating password...`);
        await firebaseAdmin.auth().updateUser(user.uid, {
            password: newPassword
        });
        console.log(`🎉 Password updated successfully for ${email}`);
        console.log(`🔑 New Password: ${newPassword}`);

    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        process.exit();
    }
}

resetPassword();
