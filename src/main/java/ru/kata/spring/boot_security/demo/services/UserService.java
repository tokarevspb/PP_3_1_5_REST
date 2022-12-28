package ru.kata.spring.boot_security.demo.services;

import ru.kata.spring.boot_security.demo.entities.User;

import java.util.List;

public interface UserService {

    boolean addUser(User user);

    User getUserById(long id);
    boolean updateUser(User user);

    boolean deleteUserById(long id);

    List<User> getAllUsers();

    User getUserByName(String name);
}
