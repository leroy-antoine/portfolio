/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** is_between_str
*/

#include "my.h"

static int check_prev(char *str, int ind, const char prev, bool equal)
{
    int count = 0;
    int value = 0;

    for (int i = ind - 1; i >= 0; i--) {
        if (str[i] == prev && equal == false)
            return i;
        if (str[i] == prev && equal == true)
            count++;
        if (str[i] == prev && equal == true && count == 1)
            value = i;
    }
    if (count % 2 == 0)
        return -1;
    return value;
}

static bool check_next(char *str, int ind, const char next, bool equal)
{
    int count = 0;

    for (int i = ind + 1; str[i] != '\0'; i++) {
        if (str[i] == next && equal == false)
            return true;
        if (str[i] == next && equal == true)
            count++;
    }
    if (count % 2 == 0)
        return false;
    return true;
}

int is_between_str(char *str, int ind, const char prev, const char next)
{
    bool equal = false;
    int value = 0;

    if (next == prev)
        equal = true;
    value = check_prev(str, ind, prev, equal);
    if (value == -1
        || check_next(str, ind, next, equal) == false)
        return -1;
    return value;
}
