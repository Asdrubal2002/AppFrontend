import React from 'react';
import { FlatList, Text, View, Image } from 'react-native';
import { useStoreReviews } from '../../../api/store/useStores';
import tw from 'twrnc';
import UserCommentCard from '../../../reusable_components/UserCommentCard';


const ReviewsList = ({ storeId }) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        error,
    } = useStoreReviews(storeId);
    if (error) return <Text>Error: {error.message}</Text>;
    const reviews = data ? data.pages.flatMap(page => page.results) : [];
    return (
        <FlatList
            data={reviews}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
                <UserCommentCard
                    initials={item.user.initials}
                    username={item.user.username}
                    content={item.comment}
                    createdAt={item.created_at}
                    rating={item.rating}
                />
            )}
            ListFooterComponent={
                isFetchingNextPage ? <Text style={{ textAlign: 'center', color: 'gray' }}>Cargando más...</Text> : null
            }
        />

    );
};

export default ReviewsList;
