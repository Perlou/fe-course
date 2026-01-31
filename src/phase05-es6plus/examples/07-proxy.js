// ES6+ Proxy 与 Reflect
// 运行: node 07-proxy.js

console.log('=== Proxy 与 Reflect ===\n');

// ========== 1. Proxy 基础 ==========
console.log('1. Proxy 基础');

const target = { name: '张三', age: 25 };

const handler = {
    get(target, property, receiver) {
        console.log(`  读取属性: ${property}`);
        return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
        console.log(`  设置属性: ${property} = ${value}`);
        return Reflect.set(target, property, value, receiver);
    }
};

const proxy = new Proxy(target, handler);

console.log('代理读取:');
console.log('  结果:', proxy.name);
console.log('代理设置:');
proxy.age = 26;

// ========== 2. 常用拦截器 ==========
console.log('\n2. 常用拦截器 (Traps)');

console.log(`
┌─────────────────────┬─────────────────────────────────────┐
│ 拦截器              │ 触发操作                             │
├─────────────────────┼─────────────────────────────────────┤
│ get                 │ 读取属性                             │
│ set                 │ 设置属性                             │
│ has                 │ in 操作符                           │
│ deleteProperty      │ delete 操作符                       │
│ apply               │ 函数调用                             │
│ construct           │ new 操作符                          │
│ getPrototypeOf      │ Object.getPrototypeOf              │
│ setPrototypeOf      │ Object.setPrototypeOf              │
│ ownKeys             │ Object.keys, for...in 等           │
│ getOwnPropertyDescriptor │ Object.getOwnPropertyDescriptor │
│ defineProperty      │ Object.defineProperty              │
└─────────────────────┴─────────────────────────────────────┘
`);

// ========== 3. 数据验证 ==========
console.log('3. 数据验证');

function createValidator(obj, rules) {
    return new Proxy(obj, {
        set(target, property, value) {
            const rule = rules[property];
            if (rule && !rule.validate(value)) {
                throw new Error(rule.message);
            }
            return Reflect.set(target, property, value);
        }
    });
}

const user = createValidator({}, {
    age: {
        validate: v => typeof v === 'number' && v >= 0 && v <= 150,
        message: '年龄必须是 0-150 的数字'
    },
    email: {
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: '邮箱格式不正确'
    }
});

user.age = 25;
user.email = 'test@example.com';
console.log('验证通过:', user);

try {
    user.age = -1;
} catch (e) {
    console.log('验证失败:', e.message);
}

// ========== 4. 默认值 ==========
console.log('\n4. 默认值');

function withDefaults(target, defaults) {
    return new Proxy(target, {
        get(target, property) {
            return property in target
                ? Reflect.get(target, property)
                : defaults[property];
        }
    });
}

const config = withDefaults({ port: 8080 }, {
    port: 3000,
    host: 'localhost',
    debug: false
});

console.log('config.port:', config.port);   // 8080 (显式设置)
console.log('config.host:', config.host);   // localhost (默认值)
console.log('config.debug:', config.debug); // false (默认值)

// ========== 5. 私有属性 ==========
console.log('\n5. 私有属性');

function createPrivate(obj) {
    return new Proxy(obj, {
        get(target, property) {
            if (property.startsWith('_')) {
                throw new Error(`属性 "${property}" 是私有的`);
            }
            return Reflect.get(target, property);
        },
        set(target, property, value) {
            if (property.startsWith('_')) {
                throw new Error(`不能设置私有属性 "${property}"`);
            }
            return Reflect.set(target, property, value);
        },
        has(target, property) {
            if (property.startsWith('_')) {
                return false;
            }
            return Reflect.has(target, property);
        },
        ownKeys(target) {
            return Reflect.ownKeys(target).filter(key => 
                typeof key !== 'string' || !key.startsWith('_')
            );
        }
    });
}

const secret = createPrivate({
    name: '公开属性',
    _secret: '私有属性'
});

console.log('公开属性:', secret.name);
console.log('属性列表:', Object.keys(secret)); // 只有 name
console.log('"_secret" in secret:', '_secret' in secret); // false

try {
    console.log(secret._secret);
} catch (e) {
    console.log('访问私有属性:', e.message);
}

// ========== 6. 函数代理 ==========
console.log('\n6. 函数代理');

function createLoggedFunction(fn, name) {
    return new Proxy(fn, {
        apply(target, thisArg, args) {
            console.log(`调用 ${name}(${args.join(', ')})`);
            const start = performance.now();
            const result = Reflect.apply(target, thisArg, args);
            const end = performance.now();
            console.log(`返回 ${result} (耗时 ${(end - start).toFixed(2)}ms)`);
            return result;
        }
    });
}

const add = createLoggedFunction((a, b) => a + b, 'add');
add(2, 3);

// ========== 7. Reflect API ==========
console.log('\n7. Reflect API');

const obj = { a: 1 };

// Reflect 方法与 Object 方法对应
console.log('Reflect.get:', Reflect.get(obj, 'a'));
console.log('Reflect.has:', Reflect.has(obj, 'a'));
console.log('Reflect.set:', Reflect.set(obj, 'b', 2));
console.log('Reflect.ownKeys:', Reflect.ownKeys(obj));
console.log('Reflect.deleteProperty:', Reflect.deleteProperty(obj, 'b'));

// Reflect 返回布尔值而不是抛出错误
const frozen = Object.freeze({ x: 1 });
console.log('Reflect.set (frozen):', Reflect.set(frozen, 'x', 2)); // false，不抛错

// ========== 8. 响应式系统 (Vue 3 原理) ==========
console.log('\n8. 响应式系统 (简化版)');

function reactive(obj) {
    const deps = new Map();
    
    return new Proxy(obj, {
        get(target, property) {
            console.log(`  [get] ${property}`);
            return Reflect.get(target, property);
        },
        set(target, property, value) {
            console.log(`  [set] ${property} = ${value}`);
            const result = Reflect.set(target, property, value);
            // 这里可以触发依赖更新
            console.log(`  [trigger] 通知更新...`);
            return result;
        }
    });
}

const state = reactive({ count: 0 });
console.log('读取:', state.count);
state.count = 1;

// ========== 9. 可撤销代理 ==========
console.log('\n9. 可撤销代理');

const { proxy: revocable, revoke } = Proxy.revocable({ name: 'target' }, {
    get(target, property) {
        return Reflect.get(target, property);
    }
});

console.log('撤销前:', revocable.name);
revoke(); // 撤销代理

try {
    console.log(revocable.name);
} catch (e) {
    console.log('撤销后:', e.message);
}

console.log('\n=== Proxy 与 Reflect 完成 ===');
