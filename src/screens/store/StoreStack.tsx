import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../home/HomeScreen';
import StoreDetailScreen from './StoreDetailScreen';
import ProductDetailScreen from '../product/ProductDetailScreen';
import CreateStore from './componentes/create/CreateStore';
import StoreAdmin from './StoreAdmin';
import PanelStore from './PanelStore';
import StoreTermsScreen from './StoreTermsScreen';
import StorePrivacyScreen from './StorePrivacyScreen';
import PostCreator from './componentes/posts/create/PostCreator';
import PostDetailsScreen from './componentes/posts/PostDetailsScreen';
import ListPosts from './componentes/posts/ListPosts';
import QRScannerScreen from './QRScannerScreen';
import CreateCategoryForm from '../product/CreateCategoryForm';
import Home from '../home/Home';
import AllProduct from '../product/AllProducts';
import AllStores from './AllStores';
import ComboDetailScreen from './componentes/ComboDetailScreen';
import ProductForm from '../product/ProductForm';
import ProductsAdminScreen from '../product/ProductsAdminScreen';
import MyShippings from './componentes/shippings/MyShippings';
import MyCoupons from './componentes/coupons/MyCoupons';
import Promotion from './componentes/oferts/Promotion';
import CreateOfert from './componentes/oferts/CreateOfert';
import StoreAdminsManager from './StoreAdminsManager';
import MyPayments from './componentes/payments/MyPayments';




const Stack = createNativeStackNavigator();

export default function StoreStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" component={Home} />

            <Stack.Screen name="ListProducts" component={AllProduct} />
            <Stack.Screen name="ListStores" component={AllStores} />

            <Stack.Screen name="ShippingsAdmin" component={MyShippings} />
            <Stack.Screen name="CouponsAdmin" component={MyCoupons} />

            <Stack.Screen name="Admins" component={StoreAdminsManager} />


            <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
            {/* Pantallas del producto */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

            <Stack.Screen name="FormProduct" component={ProductForm} />
            <Stack.Screen name="ProductsAdmin" component={ProductsAdminScreen} />

            <Stack.Screen name="Create-promotion" component={CreateOfert} />

            <Stack.Screen name="PromotionsAdmin" component={Promotion} />

            {/* Pantallas del producto */}
            <Stack.Screen name="ComboDetail" component={ComboDetailScreen} />


            <Stack.Screen name="CreateStore" component={CreateStore} />
            <Stack.Screen name="StoreAdmin" component={StoreAdmin} />
            <Stack.Screen name="StorePaymentsAdmin" component={MyPayments} />

            <Stack.Screen name="PanelStore" component={PanelStore} />
            <Stack.Screen name="TermsScreen" component={StoreTermsScreen} />
            <Stack.Screen name="PrivacyScreen" component={StorePrivacyScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />


            <Stack.Screen name="create-post" component={PostCreator} />
            <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
            <Stack.Screen name="PostList" component={ListPosts} />

            <Stack.Screen name="create-Category" component={CreateCategoryForm} />
        </Stack.Navigator>
    );
}