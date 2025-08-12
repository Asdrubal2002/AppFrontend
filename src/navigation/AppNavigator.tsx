import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabsNavigator from './BottomTabsNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={BottomTabsNavigator} />
            {/* Puedes agregar más pantallas aquí si quieres fuera de los tabs */}
        </Stack.Navigator>

    )
}