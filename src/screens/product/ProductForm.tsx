import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import tw from 'twrnc';
import { useProductMutation, useUploadProductMedia } from '../../api/product/useProducts';
import { useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Fuse from "fuse.js";
import { categoryOptionMap, predefinedOptions } from '../../constants';
import { COLORS } from '../../../theme';
import { ProductBasicInfo } from './components/createProduct/ProductBasicInfo';
import { ProductAdvancedDetails } from './components/createProduct/ProductAdvancedDetails';
import { ProductVariantEditor } from './components/createProduct/ProductVariantEditor';
import { ProductVariantSummary } from './components/createProduct/ProductVariantSummary';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UploadMediaModal from '../../reusable_components/UploadMediaModal';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../reusable_components/HeaderBar';
import BackgroundIcon from '../../reusable_components/BackgroundIcon';


interface ProductPayload {
    store_id: number;
    category?: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    is_active?: boolean;
    discount_percentage?: number;
    discount_start?: string;
    discount_end?: string;
    brand?: string;
    model?: string;
    specifications?: Record<string, string>;
    warranty?: string;
    condition?: 'Nuevo' | 'Usado';
    weight_kg?: number;
    dimensions_cm?: Record<string, number>;
    shipping_included?: boolean;
    sku?: string;
    barcode?: string;
    slug?: string;
    keywords?: string[];
    tags?: string[];
    media?: any[];
    is_featured?: boolean;
    is_recommended?: boolean;
    visibility?: 'publico' | 'privado' | 'tienda';
    options?: { name: string; values: string[] }[];
    variants?: {
        sku: string;
        price: number;
        stock: number;
        options: Record<string, string>;
    }[];
}

interface ProductFormRouteParams {
    isEdit?: boolean;
    initialData?: Partial<ProductPayload>;
    productId?: string;
    storeId?: number;
}


export const ProductForm = () => {
    const route = useRoute();
    const { isEdit = false, initialData, productId, storeId: storeIdFromRoute } = route.params as ProductFormRouteParams;

    const { mutateAsync, isPending } = useProductMutation({ isEdit, productId });

    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [iskeyWordsActive, setiskeyWordsActive] = useState(false);

    const [mainVariantIndex, setMainVariantIndex] = useState<number | null>(null);

    const [hasDifferentPrices, setHasDifferentPrices] = useState<boolean | null>(null);
    const [stockByVariant, setStockByVariant] = useState<boolean | null>(null);

    const [newSpecKey, setNewSpecKey] = React.useState('');
    const [newSpecValue, setNewSpecValue] = React.useState('');

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<any>(null);

    const navigation = useNavigation();
    const uploadMutation = useUploadProductMedia();

    const [formData, setFormData] = useState<ProductPayload>({
        store_id: initialData?.store_id || storeIdFromRoute || 0,
        name: initialData?.name || '',
        price: initialData?.price ?? 0,
        stock: initialData?.stock ?? 0,
        is_active: initialData?.is_active ?? true,
        brand: initialData?.brand || '',
        condition: initialData?.condition || 'Nuevo',
        shipping_included: initialData?.shipping_included ?? false,
        visibility: initialData?.visibility || 'publico',
        options: initialData?.options || [],
        variants: initialData?.variants || [],
        description: initialData?.description || '',
        discount_percentage: initialData?.discount_percentage,
        discount_start: initialData?.discount_start,
        discount_end: initialData?.discount_end,
        model: initialData?.model || '',
        specifications: initialData?.specifications || {},
        warranty: initialData?.warranty || '',
        weight_kg: initialData?.weight_kg,
        dimensions_cm: initialData?.dimensions_cm || { ancho: 0, alto: 0, largo: 0 },
        sku: initialData?.sku || '',
        barcode: initialData?.barcode || '',
        keywords: initialData?.keywords || [],
        tags: initialData?.tags || [],
        category: initialData?.category,
        media: initialData?.media || [],
    });

    const [keywordsText, setKeywordsText] = useState(
        (initialData?.keywords || []).join(', ')
    );
    const [tagsText, setTagsText] = useState(
        (initialData?.tags || []).join(', ')
    );

    const [selectedOptionTypes, setSelectedOptionTypes] = useState<string[]>(
        formData.options?.map((opt) => opt.name) || []
    );

    const [optionValues, setOptionValues] = useState<Record<string, string[]>>(() => {
        const result: Record<string, string[]> = {};
        formData.options?.forEach((opt) => {
            result[opt.name] = opt.values;
        });
        return result;
    });

    const handleValueChange = (field: keyof ProductPayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleOptionType = (type: string) => {
        setSelectedOptionTypes((prev) => {
            const updated = prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type];
            if (!updated.includes(type)) {
                const newValues = { ...optionValues };
                delete newValues[type];
                setOptionValues(newValues);
            }
            return updated;
        });
    };

    const generateVariants = (): {
        options: ProductPayload['options'];
        variants: ProductPayload['variants'];
    } => {
        const entries = Object.entries(optionValues);
        if (entries.length === 0) return { options: [], variants: [] };

        const buildCombos = (index = 0, prefix: Record<string, string> = {}): Record<string, string>[] => {
            if (index === entries.length) return [prefix];
            const [key, values] = entries[index];
            return values.flatMap((value) =>
                buildCombos(index + 1, { ...prefix, [key]: value })
            );
        };

        const combos = buildCombos();
        const options = selectedOptionTypes.map((name) => ({
            name,
            values: optionValues[name] || [],
        }));

        const variants = combos.map((opts, i) => {
            const skuParts = selectedOptionTypes.map(
                (k) => opts[k]?.slice(0, 3).toUpperCase()
            );
            const sku = `${formData.brand?.slice(0, 3).toUpperCase() || 'PRD'}-${skuParts.join('-')}-${i + 1}`;
            return {
                sku,
                price: formData.price,
                stock: formData.stock,
                options: opts,
            };
        });

        return { options, variants };
    };

    const handleAddVariant = () => {
        const entries = Object.entries(optionValues);
        if (entries.length === 0) return;

        const buildCombos = (index = 0, prefix: Record<string, string> = {}): Record<string, string>[] => {
            if (index === entries.length) return [prefix];
            const [key, values] = entries[index];
            return values.flatMap((value) =>
                buildCombos(index + 1, { ...prefix, [key]: value })
            );
        };

        const combos = buildCombos();

        setFormData((prev) => {
            const existingVariants = prev.variants || [];

            const newVariants = combos
                .filter((combo) =>
                    !existingVariants.some((ex) =>
                        JSON.stringify(ex.options) === JSON.stringify(combo)
                    )
                )
                .map((combo, index) => {
                    const skuParts = selectedOptionTypes.map((key) => combo[key]?.slice(0, 3).toUpperCase());
                    const sku = `${formData.brand?.slice(0, 3).toUpperCase() || 'PRD'}-${skuParts.join('-')}-${existingVariants.length + index + 1}`;

                    return {
                        sku,
                        price: 0,
                        stock: 0,
                        options: combo,
                    };
                });

            return {
                ...prev,
                variants: [...existingVariants, ...newVariants],
                options: selectedOptionTypes.map((name) => ({
                    name,
                    values: optionValues[name] || [],
                })),
            };
        });
    };

    const handleRemoveVariant = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants?.filter((_, i) => i !== index),
        }));
    };

    const [datePicker, setDatePicker] = useState<{
        field: 'discount_start' | 'discount_end' | null;
        show: boolean;
    }>({ field: null, show: false });

    const showDatePicker = (field: 'discount_start' | 'discount_end') => {
        setDatePicker({ field, show: true });
    };

    const addSpecification = () => {
        const key = newSpecKey.trim();
        const value = newSpecValue.trim();
        if (!key || !value) return;

        setFormData((prev) => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [key]: value,
            },
        }));

        setNewSpecKey('');
        setNewSpecValue('');
    };

    const removeSpecification = (key: string) => {
        const newSpecs = { ...formData.specifications };
        delete newSpecs[key];
        setFormData((prev) => ({
            ...prev,
            specifications: newSpecs,
        }));
    };


    const handleSubmit = async () => {
        if (!formData.name || !formData.store_id) {
            Alert.alert('Campos requeridos', 'Nombre es obligatorio.');
            return;
        }
        if (formData.name.length > 50) {
            return Alert.alert('Nombre muy largo', 'El nombre no debe superar los 50 caracteres/letras.');
        }
        if (formData.description.length > 500) {
            return Alert.alert('Descripción muy larga', 'La descripción no debe superar los 500 caracteres/letras.');
        }

        try {
            const { options, variants } = generateVariants();
            const payload: ProductPayload = {
                ...formData,
                options:
                    formData.options && formData.options.length > 0
                        ? formData.options
                        : generateVariants().options,
                variants:
                    formData.variants && formData.variants.length > 0
                        ? formData.variants
                        : generateVariants().variants,
                keywords: keywordsText
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                tags: tagsText
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
            };


            // Eliminar campos innecesarios
            delete (payload as any).slug;
            delete (payload as any).is_featured;
            delete (payload as any).is_recommended;

            // Validar que haya un precio global si no hay variantes
            if ((!formData.variants || formData.variants.length === 0) && (!formData.price || formData.price <= 0)) {
                Alert.alert(
                    'Precio requerido',
                    'Debes ingresar un precio para el producto si no tiene variantes.'
                );
                return;
            }
            // Validación de stock y precio
            if ((!formData.variants || formData.variants.length === 0)) {
                if (!formData.stock || formData.stock <= 0) {
                    Alert.alert('Stock requerido', 'Debes ingresar el stock si el producto no tiene variantes.');
                    return;
                }
            } else {
                const hasInvalidVariantStock = formData.variants.some((v) => !v.stock || v.stock <= 0);
                if (hasInvalidVariantStock) {
                    Alert.alert('Stock inválido', 'Todas las variantes deben tener stock mayor a 0.');
                    return;
                }
            }

            const result = await mutateAsync(payload);

            if (!isEdit) {
                setCreatedProduct(result);
                setShowUploadModal(true);

                Alert.alert(
                    'Producto creado',
                    '¡Perfecto! Ahora elige la mejor imagen para captar la atención de tus clientes.');

            } else {
                Alert.alert(
                    'Producto actualizado',
                    'Los cambios se guardaron correctamente.'
                );
                navigation.replace('ProductsAdmin', { storeId: formData.store_id });

            }
        } catch (error: any) {
            const backendErrors = error?.response?.data || error;

            // Mostrar errores generales (non_field_errors)
            if (backendErrors?.non_field_errors?.length > 0) {
                return Alert.alert('Error', backendErrors.non_field_errors.join('\n'));
            }

            // Mostrar errores de campo si existen
            const firstField = Object.keys(backendErrors)[0];
            const firstMessage = Array.isArray(backendErrors[firstField])
                ? backendErrors[firstField].join('\n')
                : backendErrors[firstField];

            return Alert.alert('Error', firstMessage || 'Ocurrió un error inesperado.');
        }
    };


    const handleUpload = async (files: any[]) => {
        // Soporte tanto para creación como edición
        const store_slug = isEdit
            ? initialData?.store_slug
            : createdProduct?.store_slug;

        const product_slug = isEdit
            ? initialData?.slug
            : createdProduct?.slug;

        if (!store_slug || !product_slug) {
            Alert.alert('Error', 'No se pudo determinar el producto para subir imágenes.');
            return;
        }

        try {
            const response = await uploadMutation.mutateAsync({
                store_slug,
                product_slug,
                files,
            });

            const { files: uploaded, errors } = response;

            if (errors?.length) {
                console.warn('Algunos archivos fallaron:', errors);
                Alert.alert(
                    'Subida parcial',
                    `Se subieron ${uploaded.length} archivo(s), pero ${errors.length} fallaron.`
                );
            } else {
                Alert.alert('Éxito', 'Archivos subidos correctamente');
            }

            setShowUploadModal(false);
            navigation.replace('ProductsAdmin', { storeId: formData.store_id });

        } catch (e: any) {
            console.log('Upload error:', e?.response?.data || e.message || e);
            Alert.alert('Error', 'No se pudieron subir los archivos');
        }
    };


    useEffect(() => {
        if (hasDifferentPrices && stockByVariant === false) {
            Alert.alert(
                'Configuración inválida',
                'Si tu producto tiene diferentes precios, el stock debe cambiar también por variante.'
            );
            setStockByVariant(true);
        }
    }, [hasDifferentPrices, stockByVariant]);


    const input = (
        label: string,
        field: keyof ProductPayload,
        placeholder: string = '',
        keyboardType: 'default' | 'numeric' = 'default',
        sanitize?: boolean
    ) => (
        <View style={tw`mb-3`}>
            <Text style={tw`text-white mb-1`}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#aaa"
                keyboardType={keyboardType}
                autoCapitalize={field === 'sku' ? 'characters' : 'none'}
                value={formData[field]?.toString() ?? ''}
                onChangeText={(text) => {
                    let processed = text;

                    if (sanitize && field === 'sku') {
                        // Eliminar espacios y todo lo que no sea letra, número o guion
                        processed = processed.replace(/[^A-Za-z0-9\-]/g, '');
                    }

                    if (keyboardType === 'numeric') {
                        const num = processed === '' ? undefined : Number(processed);
                        handleValueChange(field, isNaN(num!) ? undefined : num);
                    } else {
                        handleValueChange(field, processed);
                    }
                }}
                style={tw`bg-gray-800 text-white p-3 rounded-xl`}
            />
        </View>
    );

    const [smartSuggestedOptions, setSmartSuggestedOptions] = useState<string[]>([]);

    useEffect(() => {
        if (isEdit && initialData) {
            // Detectar si las variantes tienen precios distintos
            if (initialData.variants && initialData.variants.length > 0) {
                const prices = initialData.variants.map(v => v.price);
                const stocks = initialData.variants.map(v => v.stock);

                const uniquePrices = new Set(prices);
                const uniqueStocks = new Set(stocks);

                setHasDifferentPrices(uniquePrices.size > 1 || (uniquePrices.size === 1 && (!initialData.price || initialData.price === 0)));
                setStockByVariant(uniqueStocks.size > 1 || (uniqueStocks.size === 1 && (!initialData.stock || initialData.stock === 0)));
            } else {
                // Si no hay variantes, dependerá del global
                setHasDifferentPrices(false);
                setStockByVariant(false);
            }
        }
    }, [initialData, isEdit]);


    // 1.2 Agrega una propiedad nueva llamada `keywordsText` a cada categoría para facilitar la búsqueda
    const processedCategoryMap = categoryOptionMap.map((item) => ({
        ...item,
        keywordsText: item.keywords.join(" ")
    }));

    // 2.1 Opciones de configuración para que funcione bien
    const fuseOptions = {
        includeScore: true,
        threshold: 0.4, // Qué tan tolerante debe ser la coincidencia
        keys: ["keywordsText"]
    };

    // 2.2 Crea la instancia de búsqueda difusa
    const fuse = new Fuse(processedCategoryMap, fuseOptions);

    // 3. Función para obtener las opciones según el nombre de la categoría
    const getSmartOptions = (categoryName: string): string[] => {
        const result = fuse.search(categoryName.toLowerCase());

        if (result.length > 0) {
            return result[0].item.options; // Devuelve solo las relacionadas
        }

        // Si no hay coincidencias, devolver todas
        return predefinedOptions;
    };



    return (
        <View style={tw`flex-1`}>
            <HeaderBar title={isEdit ? 'Editar Producto o servicio' : 'Crea tu producto o servicio'} />

            {/* Ícono de fondo semitransparente */}

            <BackgroundIcon name="cube" />

            {datePicker.show && (
                <DateTimePicker
                    value={
                        formData[datePicker.field!]
                            ? new Date(formData[datePicker.field!]!)
                            : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setDatePicker({ field: null, show: false });
                        if (event.type === 'set' && selectedDate && datePicker.field) {
                            const iso = selectedDate.toISOString().split('T')[0];
                            handleValueChange(datePicker.field, iso);
                        }
                    }}
                />
            )}
            <ScrollView contentContainerStyle={tw`flex-grow px-6 py-6`}>
                {/* Información básica */}
                <ProductBasicInfo
                    formData={formData}
                    input={input}
                    handleValueChange={handleValueChange}
                    getSmartOptions={getSmartOptions}
                    setSmartSuggestedOptions={setSmartSuggestedOptions}
                    setSelectedOptionTypes={setSelectedOptionTypes}
                    hasDifferentPrices={hasDifferentPrices}
                    setHasDifferentPrices={setHasDifferentPrices}
                    stockByVariant={stockByVariant}
                    setStockByVariant={setStockByVariant}
                />
                <TouchableOpacity
                    onPress={() => setIsAdvancedMode((prev) => !prev)}
                    style={tw`bg-gray-700 p-2 rounded-2xl`}
                >
                    <Text style={tw`text-white text-center font-bold`}>
                        {isAdvancedMode ? 'Modo básico' : '¿Tu producto Tienes mas especificaciones?'}
                    </Text>
                </TouchableOpacity>
                {/* Detalles avanzados si está activado */}
                {isAdvancedMode && (
                    <ProductAdvancedDetails
                        formData={formData}
                        input={input}
                        handleValueChange={handleValueChange}
                        showDatePicker={showDatePicker}
                        setFormData={setFormData}
                        specifications={formData.specifications}
                        newSpecKey={newSpecKey}
                        newSpecValue={newSpecValue}
                        setNewSpecKey={setNewSpecKey}
                        setNewSpecValue={setNewSpecValue}
                        addSpecification={addSpecification}
                        removeSpecification={removeSpecification}
                    />
                )}
                {/* Switch de envío */}
                <View style={tw`my-4 flex-row items-center justify-between`}>
                    <Text style={tw`text-white`}>¿Incluye envío?</Text>
                    <Switch
                        value={formData.shipping_included}
                        onValueChange={(v) => handleValueChange('shipping_included', v)}
                        trackColor={{ false: '#444', true: COLORS.BlueWord }} // Gris oscuro desactivado, Azul brillante activado
                        thumbColor={formData.shipping_included ? COLORS.BlueSkyWord : '#888'} // Azul claro activado, Gris medio desactivado
                    />
                </View>
                {/* Opciones del producto */}
                {(hasDifferentPrices || stockByVariant) && (
                    <>
                        {/* Opciones del producto */}
                        <Text style={tw`text-white font-semibold mb-4`}>
                            ¿Qué opciones tiene el producto?
                        </Text>

                        <View style={tw`flex-row flex-wrap mb-4`}>
                            {smartSuggestedOptions.length === 0 ? (
                                <Text style={tw`text-gray-400 italic mb-4`}>
                                    El producto no tiene opciones o variedades.
                                </Text>
                            ) : (
                                smartSuggestedOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        onPress={() => toggleOptionType(opt)}
                                        style={tw`
              px-4 py-2 rounded-full mr-2 mb-2
              ${selectedOptionTypes.includes(opt) ? 'bg-blue-500' : 'bg-gray-600'}
            `}
                                    >
                                        <Text style={tw`text-white text-sm`}>{opt}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>

                        {/* Inputs para valores por tipo de opción */}
                        {selectedOptionTypes.map((type) => (
                            <View key={type} style={tw`mb-4`}>
                                <Text style={tw`text-blue-300 font-semibold mb-1`}>
                                    {`Valores para ${type}`}
                                </Text>
                                <TextInput
                                    placeholder={`Escribe los valores de ${type}, separados por comas (ej: Pequeño, Mediano, Grande)`}
                                    placeholderTextColor="#9CA3AF"
                                    value={optionValues[type]?.join(', ') || ''}
                                    onChangeText={(text) => {
                                        const formattedValues = text
                                            .split(',')
                                            .map((s) => {
                                                const trimmed = s.trim();
                                                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                                            });
                                        setOptionValues((prev) => ({
                                            ...prev,
                                            [type]: formattedValues,
                                        }));
                                    }}
                                    style={tw`bg-gray-800 text-white p-2 rounded-lg`}
                                    multiline
                                />
                            </View>
                        ))}



                        <TouchableOpacity
                            onPress={handleAddVariant}
                            style={tw`bg-[${COLORS.BlueWord}] rounded-xl p-3`}
                        >
                            <Text style={tw`text-white text-center`}>Generar Variantes</Text>
                        </TouchableOpacity>

                        {formData.variants?.length > 0 && (
                            <ProductVariantEditor
                                formData={formData}
                                setFormData={setFormData}
                                hasDifferentPrices={hasDifferentPrices}
                                stockByVariant={stockByVariant}
                            />
                        )}

                        {formData.variants?.length > 0 && (
                            <ProductVariantSummary
                                formData={formData}
                                mainVariantIndex={mainVariantIndex}
                                setMainVariantIndex={setMainVariantIndex}
                                handleRemoveVariant={handleRemoveVariant}
                            />
                        )}
                    </>
                )}


                <TouchableOpacity
                    onPress={() => setiskeyWordsActive((prev) => !prev)}
                    style={tw`my-6`}
                >
                    <Text style={tw`text-white font-semibold text-center`}>
                        {iskeyWordsActive
                            ? 'Ocultar etiquetas'
                            : '¿Quieres agregarle tags y etiquetas a tu producto? Presiona aquí'}
                    </Text>
                </TouchableOpacity>

                {iskeyWordsActive && (
                    <>
                        <TextInput
                            placeholder="Palabras clave separadas por coma"
                            value={keywordsText}
                            onChangeText={setKeywordsText}
                            style={tw`bg-gray-800 text-white p-3 rounded-xl mb-3`}
                        />
                        <TextInput
                            placeholder="Etiquetas separadas por coma"
                            value={tagsText}
                            onChangeText={setTagsText}
                            style={tw`bg-gray-800 text-white p-3 rounded-xl mb-3`}
                        />
                    </>

                )}
                {/* Keywords & Tags */}

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isPending}
                    style={tw`bg-[${COLORS.BlueWord}] p-2 rounded-xl`}
                >
                    <Text style={tw`text-white text-base text-center`}>
                        {isPending ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                    </Text>
                </TouchableOpacity>

                {isEdit && (
                    <TouchableOpacity
                        onPress={() => setShowUploadModal(true)}
                        style={tw`bg-gray-200 p-2 rounded-xl mt-4`}
                    >
                        <Text style={tw`text-black text-base text-center`}>
                            Agregar nuevas imágenes
                        </Text>
                    </TouchableOpacity>
                )}


            </ScrollView>
            <UploadMediaModal
                visible={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    navigation.replace('ProductsAdmin', { storeId: formData.store_id });
                }}
                onSubmit={handleUpload}
                isUploading={uploadMutation.isPending}
            />
        </View>
    );
};

export default ProductForm;
