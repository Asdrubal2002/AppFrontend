import { useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import HeaderBar from "../../../../reusable_components/HeaderBar";
import tw from 'twrnc';
import CombosList from "../CombosList";


const Promotion = () => {
    const route = useRoute();
    const storeId = route.params?.storeId;
    return (
        <>
            <HeaderBar title="Mis Promociones" />
            <View style={tw`flex-1 my-4 mx-2`}>
                <CombosList storeId={storeId} />
            </View>
        </>
    )
}
export default Promotion;