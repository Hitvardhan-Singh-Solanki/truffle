pragma solidity ^0.5.0;

contract Marketplace {

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint productCount,
        string  productName,
        uint productPrice,
        address payable owner,
        bool purchased
    );

    mapping(uint => Product) public products;

    string public name;

    uint public productCount = 0;

    constructor() public {
        name = "EY marketplace";
    }


    function createProduct(string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Name cannot be null");
        require(_price > 0, "Product should have a price");
        productCount ++;
        products[productCount] = Product({
            id: productCount,
            name:_name,
            price:_price,
            owner: msg.sender,
            purchased: false
        });

        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        Product memory _product = products[_id];
        address payable _seller = _product.owner;
        require(_product.id > 0 && _product.id <= productCount, "Make sure the product has a valid id");
        require(msg.value >= _product.price, "Require that there is enough Ether in the transaction");
        require(!_product.purchased, "Require that the product has not been purchased already");
        require(_seller != msg.sender, "Require that the buyer is not the seller");
        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;
        address(_seller).transfer(msg.value);
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}