package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.util.List;

@RestController
@RequestMapping("api/admin")
public class AdminRestController {
    private final UserService userService;

    @Autowired
    public AdminRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> usersList = userService.getAllUsers();
        if (usersList.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
        }
        return new ResponseEntity<>(usersList, HttpStatus.OK); // 200
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404
        }
        return new ResponseEntity<>(user, HttpStatus.OK); // 200
    }

    @PostMapping
    public ResponseEntity<User> addNewUser(@RequestBody User user) {
        if (userService.addUser(user)) {
            return new ResponseEntity<>(user, HttpStatus.CREATED); // 201
        }
        return new ResponseEntity<>(user, HttpStatus.CONFLICT); // 409
    }

    @PutMapping
    public ResponseEntity<User> updateUser(@RequestBody User user) {
        if (userService.updateUser(user)) {
            return new ResponseEntity<>(user, HttpStatus.OK); // 200
        }
        return new ResponseEntity<>(HttpStatus.CONFLICT); // 409
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Long> deleteUser(@PathVariable("id") Long id) {
        if (userService.deleteUserById(id)) {
            return new ResponseEntity<>(id, HttpStatus.OK); // 200
        }
        return new ResponseEntity<>(id, HttpStatus.NOT_FOUND); //404
    }
}
