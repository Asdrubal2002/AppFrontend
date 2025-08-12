import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import UserProfileScreen from './UserProfileScreen';
import TermScreen from './Terms';
import PrivacyScreen from './Privacy';
import FavoriteStores from './FavoriteStores';
import LikedPosts from './LikedPostsScreen';
import ConfigurarionApp from './Configuration';
import MyCarts from './MyCarts';
import Checkout from './components/cart/Checkout';

const Stack = createNativeStackNavigator();

export default function PerfilStack() {
    return (
        <Stack.Navigator screenOptions={{ 
            headerShown: false,
            animation: 'fade',
         }}>
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />

            <Stack.Screen name="Login" component={LoginScreen} />

            <Stack.Screen name="Register" component={RegisterScreen} />

            <Stack.Screen name="TermsScreen" component={TermScreen} />
            <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />

            <Stack.Screen name="FavoriteStoresScreen" component={FavoriteStores} />
            <Stack.Screen name="Favoritepost" component={LikedPosts} />

            <Stack.Screen name="Config" component={ConfigurarionApp} />

            <Stack.Screen name="MyCarts" component={MyCarts} />
            <Stack.Screen name="Checkout" component={Checkout} />



        </Stack.Navigator>
    );
}

