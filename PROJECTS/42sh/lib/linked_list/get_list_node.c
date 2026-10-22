/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_list_node
*/

#include "linked_list.h"

node_t *get_list_node(linked_list_t *list, void *data_to_compare,
    bool (*compare_func)(void *node_data, void *data_to_compare))
{
    node_t *node = NULL;

    if (list == NULL || compare_func == NULL)
        return NULL;
    node = list->head;
    while (node != NULL){
        if (compare_func(node->data, data_to_compare))
            return node;
        node = node->next;
    }
    return NULL;
}
