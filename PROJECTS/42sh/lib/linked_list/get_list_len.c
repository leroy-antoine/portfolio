/*
** EPITECH PROJECT, 2025
** B-CPE-200-PAR-2-1-amazed-loan.riyanto
** File description:
** get_list_len
*/

#include "linked_list.h"

int get_list_len(linked_list_t *list)
{
    int counter = 0;
    node_t *node = NULL;

    if (list == NULL)
        return 0;
    node = list->head;
    while (node != NULL){
        counter++;
        node = node->next;
    }
    return counter;
}
