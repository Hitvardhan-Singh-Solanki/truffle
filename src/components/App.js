import React, { Component } from "react";
import Web3 from "web3";
import Marketplace from "../abis/Marketplace.json";
import logo from "../logo.png";
import "./App.css";
import Navbar from "./Navbar";
import Loader from "./loader.js";
import Content from "./Content.js";
class App extends Component {
  state = {
    isLoadingWeb3: true,
    account: "",
    productCount: 0,
    products: []
  };

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const marketplace = web3.eth.Contract(
        Marketplace.abi,
        networkData.address
      );
      this.setState({ marketplace });
      const productCount = await marketplace.methods.productCount().call();
      // TODO
      this.setState({ productCount });
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({
          products: [...this.state.products, product]
        });
      }
      this.setState({ loading: false });
    } else {
      window.alert("Marketplace contract not deployed to detected network.");
    }
  };

  purchaseProduct = (id, price) => {
    this.setState({ loading: true });
    this.state.marketplace.methods
      .purchaseProduct(id)
      .send({ from: this.state.account, value: price })
      .once("receipt", receipt => {
        this.setState({ loading: false });
      });
  };

  createProduct = (name, price) => {
    this.setState({ loading: true });
    this.state.marketplace.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .once("receipt", () => {
        this.setState({ loading: false });
      });
  };

  componentDidMount = async () => {
    await this.loadWeb3();
    await this.loadBlockchainData();
    this.setState({ isLoadingWeb3: false });
  };

  render() {
    return (
      <div>
        <Navbar logo={logo} account={this.state.account} />
        <div className="container-fluid mt-5" style={{ paddingTop: 50 }}>
          <div className={"row"}>
            <main role={"main"} className={"col-lg-12 d-flex"}>
              {this.state.isLoadingWeb3 ? (
                <Loader />
              ) : (
                <Content
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
