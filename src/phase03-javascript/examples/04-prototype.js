// JavaScript 原型与原型链
// 运行: node 04-prototype.js

console.log('=== JavaScript 原型与原型链 ===\n');

// ========== 1. 原型基础 ==========
console.log('1. 原型基础');

// 每个函数都有 prototype 属性
function Person(name) {
    this.name = name;
}

// 在原型上定义方法（所有实例共享）
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const person1 = new Person('张三');
const person2 = new Person('李四');

console.log(person1.greet()); // Hello, I'm 张三
console.log(person2.greet()); // Hello, I'm 李四

// 验证方法是共享的
console.log('方法共享:', person1.greet === person2.greet); // true

// ========== 2. 原型链 ==========
console.log('\n2. 原型链');

console.log(`
原型链图解:
┌─────────────────────────────────────────────────────┐
│                                                     │
│  person1 ──__proto__──► Person.prototype            │
│                              │                      │
│                         __proto__                   │
│                              ▼                      │
│                        Object.prototype             │
│                              │                      │
│                         __proto__                   │
│                              ▼                      │
│                            null                     │
│                                                     │
└─────────────────────────────────────────────────────┘
`);

// 验证原型链
console.log('person1.__proto__ === Person.prototype:', person1.__proto__ === Person.prototype);
console.log('Person.prototype.__proto__ === Object.prototype:', Person.prototype.__proto__ === Object.prototype);
console.log('Object.prototype.__proto__ === null:', Object.prototype.__proto__ === null);

// ========== 3. 属性查找 ==========
console.log('\n3. 属性查找');

Person.prototype.species = 'Human';

console.log('person1.name:', person1.name);           // 实例属性
console.log('person1.species:', person1.species);     // 原型属性
console.log('person1.toString():', person1.toString()); // Object.prototype 上的方法

// 判断属性来源
console.log('\nhasOwnProperty:');
console.log('  name:', person1.hasOwnProperty('name'));       // true (自身属性)
console.log('  species:', person1.hasOwnProperty('species')); // false (原型属性)
console.log('  greet:', person1.hasOwnProperty('greet'));     // false (原型属性)

// in 操作符检查原型链上的所有属性
console.log('\nin 操作符:');
console.log('  "name" in person1:', 'name' in person1);       // true
console.log('  "species" in person1:', 'species' in person1); // true

// ========== 4. 构造函数、原型、实例关系 ==========
console.log('\n4. 构造函数、原型、实例关系');

console.log('Person.prototype.constructor === Person:', Person.prototype.constructor === Person);
console.log('person1.constructor === Person:', person1.constructor === Person);
console.log('person1 instanceof Person:', person1 instanceof Person);
console.log('person1 instanceof Object:', person1 instanceof Object);

// ========== 5. 原型继承 ==========
console.log('\n5. 原型继承');

// 父类
function Animal(name) {
    this.name = name;
}
Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

// 子类
function Dog(name, breed) {
    Animal.call(this, name); // 继承实例属性
    this.breed = breed;
}

// 继承原型方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // 修复 constructor

// 添加子类方法
Dog.prototype.bark = function() {
    return `${this.name} barks!`;
};

// 重写父类方法
Dog.prototype.speak = function() {
    return `${this.name} says woof!`;
};

const dog = new Dog('旺财', '金毛');
console.log(dog.speak()); // 旺财 says woof!
console.log(dog.bark());  // 旺财 barks!
console.log('dog instanceof Dog:', dog instanceof Dog);
console.log('dog instanceof Animal:', dog instanceof Animal);

// ========== 6. ES6 class 语法 ==========
console.log('\n6. ES6 class 语法');

class Cat {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return `${this.name} meows`;
    }
    
    static create(name) {
        return new Cat(name);
    }
}

class Kitten extends Cat {
    constructor(name, age) {
        super(name);
        this.age = age;
    }
    
    speak() {
        return `${super.speak()} softly`;
    }
}

const kitten = new Kitten('咪咪', 1);
console.log(kitten.speak()); // 咪咪 meows softly
console.log('静态方法:', Cat.create('小白').name);

// class 本质上还是原型
console.log('\nclass 本质:');
console.log('typeof Cat:', typeof Cat); // function
console.log('Cat.prototype.speak:', typeof Cat.prototype.speak); // function

// ========== 7. 手写 new 操作符 ==========
console.log('\n7. 手写 new 操作符');

function myNew(Constructor, ...args) {
    // 1. 创建空对象，原型指向构造函数的 prototype
    const obj = Object.create(Constructor.prototype);
    // 2. 执行构造函数，绑定 this
    const result = Constructor.apply(obj, args);
    // 3. 返回对象（如果构造函数返回对象则用那个）
    return result instanceof Object ? result : obj;
}

function User(name) {
    this.name = name;
}
User.prototype.sayHi = function() {
    return `Hi, ${this.name}`;
};

const user = myNew(User, '测试');
console.log('myNew 创建:', user.sayHi());
console.log('instanceof User:', user instanceof User);

// ========== 8. 手写 instanceof ==========
console.log('\n8. 手写 instanceof');

function myInstanceof(obj, Constructor) {
    let proto = Object.getPrototypeOf(obj);
    while (proto !== null) {
        if (proto === Constructor.prototype) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

console.log('myInstanceof(dog, Dog):', myInstanceof(dog, Dog));
console.log('myInstanceof(dog, Animal):', myInstanceof(dog, Animal));
console.log('myInstanceof(dog, Cat):', myInstanceof(dog, Cat));

console.log('\n=== 原型与原型链完成 ===');
