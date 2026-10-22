/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** is_in_str
*/

int is_in_str(const char *str, const char c)
{
    for (int i = 0; str[i] != '\0'; i++) {
        if (str[i] == c)
            return i;
    }
    return -1;
}
