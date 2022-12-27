/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
// import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import store from "../__mocks__/store";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill should be render", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByTestId("icon-mail")).toBeTruthy();
    });
  });

  describe("When I upload a file with invalid format", () => {
    test("Then it should display an error message", () => {
      document.body.innerHTML = NewBillUI();
      //Instanciation class NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      //simulate loading file
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");

      //Listen charging file
      inputFile.addEventListener("change", handleChangeFile);

      //Simulate it with FireEvent
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["test.txt"], "test.txt", { type: "image/txt" })],
        },
      });

      //An error message have to appear
      const error = screen.getByTestId("errorMessage");
      expect(error).toBeTruthy();
    });
  });

  describe("When I submit the form completed", () => {
    test("Then the bill is created", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const validBill = {
        type: "Restaurants et bars",
        name: "Vol Paris Londres",
        date: "2022-02-15",
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: "Commentary",
        fileUrl: "../img/0.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;

      newBill.fileName = validBill.fileName;
      newBill.fileUrl = validBill.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  });
});

describe("Given I am a user connected as Employee", () => {});
