// ProductsAdminScreen.tsx
import { useRoute } from '@react-navigation/native';
import ProductsList from '../store/componentes/ProductsList';
import { View } from 'react-native';
import tw from 'twrnc';
import HeaderBar from '../../reusable_components/HeaderBar';

const ProductsAdminScreen = () => {
  const route = useRoute();
  const { storeId } = route.params;

  return (
    <>
      <HeaderBar title="Mis Productos" />
      <View style={tw`flex-1 my-4 mx-2 `}>
        <ProductsList storeId={storeId} />
      </View>
    </>
  );
};
export default ProductsAdminScreen;
