/*
** EPITECH PROJECT, 2025
** push_to_head.c
** File description:
** linked_list
*/

#include "linked_list.h"

void delete_node(linked_list_t *list, node_t *actual_node
    , void (*free_data)(void *data))
{
    if (actual_node == NULL)
        return;
    if (actual_node->prev != NULL)
        (actual_node->prev)->next = actual_node->next;
    if (actual_node->next != NULL)
        (actual_node->next)->prev = actual_node->prev;
    if (list->head == actual_node)
        list->head = actual_node->next;
    if (list->tail == actual_node)
        list->tail = actual_node->prev;
    free_data(actual_node->data);
    free(actual_node);
}
