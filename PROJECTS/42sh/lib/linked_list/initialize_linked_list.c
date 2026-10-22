/*
** EPITECH PROJECT, 2025
** B-CPE-200-PAR-2-1-amazed-loan.riyanto
** File description:
** initialize_linked_list
*/

#include "linked_list.h"

linked_list_t *initialize_linked_list(void)
{
    linked_list_t *linked_list = malloc(sizeof(linked_list_t));

    if (linked_list == NULL)
        return NULL;
    linked_list->head = NULL;
    linked_list->tail = NULL;
    return linked_list;
}
