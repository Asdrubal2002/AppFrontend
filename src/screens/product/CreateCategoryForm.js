import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, KeyboardAvoidingView } from 'react-native';
import tw from 'twrnc';
import { useCreateCategory, useDeleteCategory, useStoreCategories, useUpdateCategory } from '../../api/product/useProducts';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../theme';
import AuthInput from '../../reusable_components/AuthInput';
import AuthButton from '../../reusable_components/AuthButton';
import { useNavigation } from "@react-navigation/native";
import HeaderBar from '../../reusable_components/HeaderBar';



const CreateCategoryForm = () => {
    const route = useRoute();
    const storeId = route.params?.storeId;
    const navigation = useNavigation();

    // Estados del formulario
    const [form, setForm] = useState({
        name: '',
        parent_ids: []
    });

    // Estados para gestión de UI
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [editModal, setEditModal] = useState({
        visible: false,
        category: null
    });
    const [showHelp, setShowHelp] = useState(false);

    const [step, setStep] = useState(1);
    const scrollRef = useRef < ScrollView > (null);
    const [isViewingOnly, setIsViewingOnly] = useState(false);
    const [hasJustCreated, setHasJustCreated] = useState(false);

    // Datos y mutaciones
    const { data: categories = [] } = useStoreCategories(storeId, { enabled: true });
    const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutate: deleteCategory } = useDeleteCategory();
    const { mutate: updateCategory } = useUpdateCategory();

    // Validación del formulario
    const validateForm = () => {
        if (!form.name.trim()) {
            Alert.alert('Error', 'El nombre de la categoría es obligatorio.');
            return false;
        }

        // Puedes permitir parent_ids vacío (para categorías principales)
        if (!Array.isArray(form.parent_ids)) {
            Alert.alert('Error', 'Ocurrió un problema con la selección de categorías padre.');
            return false;
        }

        return true;
    };


    // Handlers principales
    const handleCreateCategory = () => {
        if (!validateForm()) return;

        const payload = {
            name: form.name,
            store: storeId,
            parent_ids: form.parent_ids
        };

        console.log('📦 Datos enviados al backend:', payload); // 👈 Esto imprime lo que se enviará

        createCategory(
            payload,
            {
                onSuccess: () => {
                    Alert.alert('Éxito', 'Categoría(s) creada(s) exitosamente');
                    setForm({ name: '', parent_ids: [] });
                    setHasJustCreated(true);
                    setIsViewingOnly(true); // Si decides activar modo visualización
                },
                onError: (error) => {
                    console.error('❌ Error al crear categoría:', error); // También muestra si hay error
                },
            }
        );
    };


    const handleDeleteCategory = (category) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar "${category.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteCategory(
                        { categoryId: category.id, storeId },
                        {
                            onSuccess: () => Alert.alert('✅ Éxito', 'Categoría eliminada correctamente'),
                            onError: (error) => Alert.alert('❌ Error', error.message)
                        }
                    )
                }
            ]
        );
    };

    const handleUpdateCategory = () => {
        const { id, name, parent, store } = editModal.category;

        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre válido para la categoría.');
            return;
        }

        updateCategory(
            {
                categoryId: id,
                updatedData: { name, parent: parent || null, store }
            },
            {
                onSuccess: () => {
                    setEditModal({ visible: false, category: null });
                    Alert.alert('Actualizada', 'Categoría actualizada correctamente');
                },
                onError: (error) => {
                    const errorMsg =
                        error?.response?.data?.error || 'No se pudo actualizar la categoría';
                    Alert.alert('Error', errorMsg);
                }
            }
        );
    };
    // Helpers para renderizado
    const toggleCategoryExpand = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const renderCategoryItem = (category, options = {}) => {
        const { level = 0, isEditMode = false, isViewingOnly = false } = options;
        const isExpanded = expandedCategories.includes(category.id);
        const hasSubcategories = category.subcategories?.length > 0;

        // 👇 Determina si está seleccionado, dependiendo del modo
        const isSelected = isEditMode
            ? editModal.category?.parent === category.id
            : isViewingOnly
                ? false
                : Array.isArray(form?.parent_ids) && form.parent_ids.includes(category.id);

        return (
            <View key={category.id} style={[styles.categoryContainer, { marginLeft: level * 16 }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (isEditMode) {
                            setEditModal(prev => ({
                                ...prev,
                                category: { ...prev.category, parent: category.id }
                            }));
                        } else {
                            // ✅ Alternar selección múltiple (checkbox)
                            setForm(prev => {
                                const alreadySelected = prev.parent_ids.includes(category.id);
                                return {
                                    ...prev,
                                    parent_ids: alreadySelected
                                        ? prev.parent_ids.filter(id => id !== category.id)
                                        : [...prev.parent_ids, category.id]
                                };
                            });
                        }
                    }}
                    style={[
                        styles.categoryButton,
                        isSelected && styles.selectedCategory
                    ]}
                >
                    <View style={tw`flex-row items-center flex-1`}>
                        <Ionicons
                            // ✅ Mostrar checkbox si no estás editando
                            name={
                                isEditMode
                                    ? isSelected
                                        ? "radio-button-on"
                                        : "radio-button-off"
                                    : isSelected
                                        ? "checkbox"
                                        : "square-outline"
                            }
                            size={20}
                            color={isSelected ? "#ffffff" : COLORS.BlueWord}
                            style={tw`mr-3`}
                        />
                        <Text style={tw`text-white text-base`}>{category.name}</Text>
                    </View>

                    {!isEditMode && (
                        <View style={tw`flex-row items-center`}>
                            <TouchableOpacity
                                onPress={() => setEditModal({ visible: true, category: { ...category } })}
                            >
                                <Ionicons name="create-outline" size={20} color={COLORS.BlueSkyWord} />
                            </TouchableOpacity>
                            <TouchableOpacity style={tw`mx-4`} onPress={() => handleDeleteCategory(category)}>
                                <Ionicons name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {hasSubcategories && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation?.();
                                toggleCategoryExpand(category.id);
                            }}>
                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={COLORS.BlueSkyWord}
                            />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {isExpanded && hasSubcategories && (
                    <View style={tw`mt-1`}>
                        {category.subcategories.map(subCat =>
                            renderCategoryItem(subCat, { ...options, level: level + 1 })
                        )}
                    </View>
                )}
            </View>
        );
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const renderCreateNewCategoryButton = () => (
        <>
            <TouchableOpacity
                onPress={() => {
                    setStep(1);
                    setIsViewingOnly(false);
                    setHasJustCreated(false);
                    setForm({ name: '', parent_ids: [] });
                }}
                style={tw`mt-4`}
            >
                <Text style={tw`text-center p-5 mb-4 rounded-2xl border border-gray-600`}>
                    Crear nueva categoría
                </Text>
            </TouchableOpacity>

        </>

    );

    // Renderizado condicional
    if (!storeId) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
                <Text style={tw`text-red-500 text-lg font-bold`}>❌ No se encontró el ID de la tienda.</Text>
            </View>
        );
    }

    return (
        <View style={tw`flex-1`}>
            <HeaderBar title="Mis categorías" />

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={tw`flex-grow px-6 py-6`}
                keyboardShouldPersistTaps="handled"
            >
                {step === 1 && (
                    <CategoryCreationSection
                        form={form}
                        setForm={setForm}
                        showHelp={showHelp}
                        setShowHelp={setShowHelp}
                    />
                )}

                {step === 2 && (
                    <CategoryParentSelector
                        form={form}
                        setForm={setForm}
                        categories={categories}
                        renderCategoryItem={renderCategoryItem}
                        isViewingOnly={isViewingOnly}
                    />
                )}
            </ScrollView>

            {/* Botones */}
            <View style={tw`px-4`}>
                {/* Paso 1 */}
                {step === 1 && (
                    <>
                        <AuthButton
                            title="Siguiente paso"
                            icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
                            onPress={() => {
                                if (!form.name.trim()) {
                                    Alert.alert('Nombre tu categoría', 'El nombre de la categoría es obligatorio.');
                                    return;
                                }
                                setIsViewingOnly(false);
                                handleNext();
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setIsViewingOnly(true);
                                handleNext();
                            }}
                            style={tw`p-5 mb-4 rounded-2xl border border-gray-600`}
                        >
                            <Text style={tw`text-center `}>
                                Prefiero ver mis categorías
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Paso 2 */}
                {step === 2 && (
                    <>
                        {(isViewingOnly || hasJustCreated)
                            ? renderCreateNewCategoryButton()
                            : (
                                <>
                                    <TouchableOpacity
                                        onPress={handleBack}
                                        style={tw`my-6`}
                                    >
                                        <Text style={tw`text-center text-gray-400 text-sm`}>
                                            ← Volver
                                        </Text>
                                    </TouchableOpacity>

                                    <AuthButton
                                        title={isCreating ? 'Creando...' : 'Crear categoría'}
                                        icon={<Ionicons name="checkmark-done" size={20} color="#fff" />}
                                        onPress={handleCreateCategory}
                                        disabled={isCreating}
                                    />
                                </>
                            )
                        }

                    </>

                )}


            </View>


            {/* Modal de edición */}
            <EditCategoryModal
                visible={editModal.visible}
                category={editModal.category}
                setCategory={(updates) => setEditModal(prev => ({
                    ...prev,
                    category: { ...prev.category, ...updates }
                }))}
                categories={categories}
                onClose={() => setEditModal({ visible: false, category: null })}
                onSave={handleUpdateCategory}
                renderCategoryItem={renderCategoryItem}
            />
        </View>
    );
};

// Componentes separados para mejor organización
const CategoryCreationSection = ({ form, setForm, showHelp, setShowHelp }) => (
    <View style={tw`flex-1 justify-center p-4`}>
        <View style={tw`flex-row items-center mb-4 justify-between`}>
            <View style={tw`flex-row items-center`}>
                <Text style={tw`text-white text-lg`}>¿Como se llamara tu categoría?</Text>
            </View>
        </View>

        {showHelp && (
            <View style={tw`mb-4 p-4 bg-gray-600/90 rounded-lg`}>
                {/* Sección de consejos con iconos */}
                <View style={tw`mb-3`}>
                    <View style={tw`flex-row items-start mb-2`}>
                        <Ionicons name="information-circle" size={16} color={COLORS.BlueSkyWord} style={tw`mt-1 mr-2`} />
                        <Text style={tw`text-white text-sm flex-1`}>
                            <Text style={tw`font-bold`}>Consejo:</Text> Usa nombres descriptivos como "Ropa de invierno", no códigos como "INV-001"
                        </Text>
                    </View>

                    <View style={tw`flex-row items-start`}>
                        <Ionicons name="warning" size={16} color="#FBBF24" style={tw`mt-1 mr-2`} />
                        <Text style={tw`text-white text-sm flex-1`}>
                            <Text style={tw`font-bold`}>Evita:</Text> Símbolos especiales o nombres demasiado largos
                        </Text>
                    </View>
                </View>

                {/* Ejemplo de jerarquía con mejor formato */}
                <View style={tw`mb-3 p-3 bg-gray-700/50 rounded-md`}>
                    <Text style={tw`text-blue-300 text-sm mb-2 font-semibold`}>🧭 Ejemplo de estructura recomendada:</Text>
                    <View style={tw`ml-2`}>
                        <Text style={tw`text-white text-sm`}>• <Text style={tw`font-bold`}>Electrónica</Text></Text>
                        <Text style={tw`text-white text-sm ml-4`}>└ <Text style={tw`font-medium`}>Computadoras</Text></Text>
                        <Text style={tw`text-white text-sm ml-8`}>  └ Laptops Gaming</Text>
                        <Text style={tw`text-white text-sm mt-1`}>• <Text style={tw`font-bold`}>Hogar</Text></Text>
                        <Text style={tw`text-white text-sm ml-4`}>└ <Text style={tw`font-medium`}>Cocina</Text></Text>
                    </View>
                </View>

                {/* Tips rápidos con mejor visualización */}
                <View style={tw`flex-row flex-wrap gap-2`}>
                    <View style={tw`flex-row items-center bg-gray-700 px-2 py-1 rounded-full`}>
                        <Ionicons name="star" size={14} color="#FBBF24" style={tw`mr-1`} />
                        <Text style={tw`text-white text-xs`}>Máx. 3 niveles</Text>
                    </View>
                    <View style={tw`flex-row items-center bg-gray-700 px-2 py-1 rounded-full`}>
                        <Ionicons name="checkmark" size={14} color="#10B981" style={tw`mr-1`} />
                        <Text style={tw`text-white text-xs`}>Nombres simples</Text>
                    </View>
                    <View style={tw`flex-row items-center bg-gray-700 px-2 py-1 rounded-full`}>
                        <Ionicons name="list" size={14} color={COLORS.BlueSkyWord} style={tw`mr-1`} />
                        <Text style={tw`text-white text-xs`}>Jerarquía clara</Text>
                    </View>
                </View>
            </View>
        )}

        <AuthInput
            value={form.name}
            onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
            placeholder="Ej: Medicinas para gatos"
        />
        <TouchableOpacity
            onPress={() => setShowHelp(!showHelp)}
            style={[
                tw`flex-row items-center px-3 py-1 rounded-full`,
                {
                    backgroundColor: showHelp ? COLORS.BlueWord : 'transparent',
                }
            ]}
        >
            <Ionicons
                name="help-circle"
                size={18}
                color={showHelp ? '#ffffff' : COLORS.BlueSkyWord}
                style={tw`mr-1`}
            />
            <Text style={[
                tw`text-sm`,
                showHelp ? tw`text-white` : tw`text-blue-400`
            ]}>
                {showHelp ? 'Ocultar ayuda' : '¿Necesitas ayuda?'}
            </Text>
        </TouchableOpacity>
    </View>
);

const CategoryParentSelector = ({ form, setForm, categories, renderCategoryItem, isViewingOnly }) => (
    <View style={tw`flex-1 justify-center p-4`}>

        {!isViewingOnly && (
            <>
                <Text style={tw`text-white text-lg mb-2`}>
                    Escoge a qué categoría o categorías pertenece {' '}
                    <Text style={tw`text-yellow-400 font-semibold`}>{form.name}</Text>
                </Text>

                <TouchableOpacity
                    onPress={() => setForm(prev => ({ ...prev, parent_ids: [] }))}
                    style={[
                        tw`flex-row items-center p-3 rounded-lg mb-2`,
                        {
                            backgroundColor: (form.parent_ids ?? []).length === 0
                                ? COLORS.Modals
                                : '#1f2937'
                        }
                    ]}
                >
                    <Ionicons
                        name={(form.parent_ids ?? []).length === 0 ? "checkbox" : "square-outline"}
                        size={20}
                        color={(form.parent_ids ?? []).length === 0 ? "#ffffff" : COLORS.BlueSkyWord}
                        style={tw`mr-3`}
                    />
                    <Text style={tw`text-white text-base`}>Es una categoría principal</Text>
                </TouchableOpacity>


            </>
        )}

        {categories.length === 0 ? (
            <Text style={tw`text-white text-center my-4`}>
                No tienes categorías aún. ¡Crea una para comenzar!
            </Text>
        ) : (
            categories.map(category =>
                renderCategoryItem(category, { isEditMode: false, isViewingOnly })
            )
        )}
    </View>
);


const EditCategoryModal = ({
    visible,
    category,
    setCategory,
    categories,
    onClose,
    onSave,
    renderCategoryItem
}) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-center`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={tw`flex-1`}
            >
                <ScrollView
                    contentContainerStyle={tw`flex-grow justify-center items-center p-4`}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={tw`bg-gray-900 p-6 w-full rounded-xl max-w-xl`}>
                        <Text style={tw`text-white text-lg mb-4 font-bold`}>Editar categoría</Text>

                        <Text style={tw`text-gray-400 mb-1`}>Nombre:</Text>
                        <AuthInput
                            value={category?.name || ''}
                            onChangeText={(text) => setCategory({ name: text })}
                            placeholder="Nuevo nombre de la categoría"
                        />

                        <Text style={tw`text-gray-400 mb-2`}>Escoge a qué categoría pertenece</Text>

                        <TouchableOpacity
                            onPress={() => setCategory({ parent: null })}
                            style={[
                                tw`flex-row items-center p-3 rounded-lg mb-2`,
                                { backgroundColor: category?.parent === null ? COLORS.BlueWord : '#1f2937' }
                            ]}
                        >
                            <Ionicons
                                name={category?.parent === null ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={category?.parent === null ? "#ffffff" : COLORS.BlueSkyWord}
                                style={tw`mr-3`}
                            />
                            <Text style={tw`text-white text-base`}>Es una categoría principal</Text>
                        </TouchableOpacity>

                        {categories.map(cat =>
                            cat.id !== category?.id && renderCategoryItem(cat, { isEditMode: true })
                        )}

                        <View style={tw`flex-row justify-between mt-4`}>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={tw`text-red-500`}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onSave}>
                                <Text style={tw`text-blue-400 font-bold`}>Actualizar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    </Modal>

);

// Estilos (igual que en tu versión original)
const styles = StyleSheet.create({
    categoryContainer: { marginBottom: 4 },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#1f2937',
    },
    selectedCategory: { backgroundColor: COLORS.Modals },
    submitButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgb(1, 1, 1)',
        borderTopWidth: 1,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.BlueWord,
    },
    submitButtonDisabled: { opacity: 0.7 },
});

export default CreateCategoryForm;