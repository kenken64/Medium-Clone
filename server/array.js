arrA = [
    {
        first_name: "Kelvin",
        last_name: "Lee"
    },
    {
        first_name: "Kenneth",
        last_name: "Lee"
    },
];


arrB = [
    {
        first_name: "Alex",
        last_name: "Lee"
    },
    {
        first_name: "Kenneth",
        last_name: "Lee"
    },
    {
        first_name: "Kenneth",
        last_name: "Phang"
    },
]

let intersection = arrA.filter(x => {
    return x.first_name == "Kenneth";
});


let intersection2 = arrB.filter(x => {
    return x.last_name == "Lee";
});


console.log(intersection.concat(intersection2));
