/*
** EPITECH PROJECT, 2025
** 42
** File description:
** get_nblen
*/

int get_nblen(int nb)
{
    int count = 0;
    double tmp = nb;

    while (tmp > 0.0) {
        tmp /= 10;
        count++;
    }
    if (nb == 0)
        count++;
    return count;
}
