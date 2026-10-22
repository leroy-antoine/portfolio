/*
** EPITECH PROJECT, 2025
** B-CPE-200-PAR-2-1-amazed-loan.riyanto
** File description:
** free_list
*/

#include "linked_list.h"

void free_linked_list(linked_list_t *list, void (*free_data)(void *data))
{
    node_t *head = list->head;
    node_t *node_to_delete = NULL;

    if (list == NULL)
        return;
    if (list->head == NULL) {
        free(list);
        return;
    }
    while (head != NULL){
        node_to_delete = head;
        head = head->next;
        delete_node(list, node_to_delete, free_data);
    }
    free(list);
    return;
}
