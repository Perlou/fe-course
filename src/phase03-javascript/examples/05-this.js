// JavaScript this 绑定
// 运行: node 05-this.js

console.log('=== JavaScript this 绑定 ===\n');

// ========== 1. 默认绑定 ==========
console.log('1. 默认绑定 (非严格模式: window/global, 严格模式: undefined)');

function showThis() {
    // 非严格模式下指向全局对象
    // 严格模式下是 undefined
    console.log('默认绑定 this:', this === globalThis ? 'globalThis' : this);
}

showThis();

// ========== 2. 隐式绑定 ==========
console.log('\n2. 隐式绑定 (作为对象方法调用)');

const person = {
    name: '张三',
    greet() {
        console.log(`Hello, I'm ${this.name}`);
    },
    nested: {
        name: '嵌套对象',
        greet() {
            console.log(`嵌套: ${this.name}`);
        }
    }
};

person.greet();        // this = person
person.nested.greet(); // this = nested

// 隐式丢失
console.log('\n隐式丢失:');
const greetFn = person.greet;
greetFn(); // this 丢失，不再指向 person

// ========== 3. 显式绑定 ==========
console.log('\n3. 显式绑定 (call / apply / bind)');

function introduce(greeting, punctuation) {
    console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const user1 = { name: '李四' };
const user2 = { name: '王五' };

// call - 逐个传参
introduce.call(user1, 'Hi', '!');

// apply - 数组传参
introduce.apply(user2, ['Hello', '~']);

// bind - 返回新函数
const boundIntroduce = introduce.bind(user1, 'Hey');
boundIntroduce('!!!');

// ========== 4. new 绑定 ==========
console.log('\n4. new 绑定');

function Person(name) {
    this.name = name;
    // new 调用时，this 指向新创建的对象
    console.log('new 绑定 this:', this);
}

const p = new Person('赵六');
console.log('实例:', p.name);

// ========== 5. 箭头函数 ==========
console.log('\n5. 箭头函数 (继承外层 this)');

const obj = {
    name: '对象',
    traditional: function() {
        console.log('传统函数 this:', this.name);
    },
    arrow: () => {
        // 箭头函数没有自己的 this，继承定义时的外层 this
        console.log('箭头函数 this:', this);
    },
    nested: function() {
        // 在对象方法内使用箭头函数
        const inner = () => {
            console.log('嵌套箭头函数 this:', this.name);
        };
        inner();
    }
};

obj.traditional(); // 对象
obj.arrow();       // globalThis (定义时的外层作用域)
obj.nested();      // 对象 (继承 nested 函数的 this)

// ========== 6. this 优先级 ==========
console.log('\n6. this 优先级');

console.log(`
优先级 (从高到低):
1. new 绑定
2. 显式绑定 (call/apply/bind)
3. 隐式绑定 (对象方法)
4. 默认绑定 (独立调用)

注意: 箭头函数忽略所有绑定规则，始终使用定义时的 this
`);

// 优先级验证
function foo() {
    console.log(this.name);
}

const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

// 显式 > 隐式
const bar = foo.bind(obj1);
obj2.bar = bar;
obj2.bar(); // obj1 (bind 的优先级更高)

// new > 显式
function Foo(name) {
    this.name = name;
}
const boundFoo = Foo.bind(obj1);
const instance = new boundFoo('newInstance');
console.log('new > bind:', instance.name); // newInstance

// ========== 7. 手写 call / apply / bind ==========
console.log('\n7. 手写 call / apply / bind');

// 手写 call
Function.prototype.myCall = function(context, ...args) {
    context = context || globalThis;
    const fn = Symbol('fn');
    context[fn] = this;
    const result = context[fn](...args);
    delete context[fn];
    return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
    context = context || globalThis;
    const fn = Symbol('fn');
    context[fn] = this;
    const result = context[fn](...args);
    delete context[fn];
    return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
    const self = this;
    return function boundFn(...moreArgs) {
        // 支持 new 调用
        if (this instanceof boundFn) {
            return new self(...args, ...moreArgs);
        }
        return self.myApply(context, args.concat(moreArgs));
    };
};

// 测试
function testThis(a, b) {
    return `${this.name}: ${a + b}`;
}

const testObj = { name: 'Test' };
console.log('myCall:', testThis.myCall(testObj, 1, 2));
console.log('myApply:', testThis.myApply(testObj, [3, 4]));
console.log('myBind:', testThis.myBind(testObj, 5)(6));

// ========== 8. 常见陷阱 ==========
console.log('\n8. 常见陷阱');

// 回调函数中的 this
const button = {
    text: '点击',
    click() {
        console.log('传统回调:', this); // 可能丢失
        
        // 解决方案1: 箭头函数
        const arrowCb = () => console.log('箭头函数:', this.text);
        arrowCb();
        
        // 解决方案2: bind
        const boundCb = function() {
            console.log('bind:', this.text);
        }.bind(this);
        boundCb();
        
        // 解决方案3: 保存 this
        const self = this;
        const selfCb = function() {
            console.log('self:', self.text);
        };
        selfCb();
    }
};

button.click();

console.log('\n=== this 绑定完成 ===');
