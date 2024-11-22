import XLSX from 'xlsx'; 
import path from 'path';

describe('TP Final Automatización', () => {
  it('Debe cargar el excel y actualizar los precios de los productos.', () => {

    const excelPath = 'cypress/fixtures/precios_diarios.xlsx';
    const usuarioAdmin = 'admin';
    const contraseñaAdmin = 'admin';

    cy.visit('http://localhost:4200/login');

    // Autenticación
    cy.get('#loginName').type(usuarioAdmin);
    cy.get('#loginPass').type(contraseñaAdmin);
    cy.get('#loginSubmit').click();

    // Verificación de redirección a estadísticas
    cy.url().should('include', 'estadisticas');

    cy.visit('http://localhost:4200/preciostock');
      
    let cantidadDePreciosActualizados = 0;
    let cambioDePrecios = [];

    cy.readFile(excelPath, 'binary').then((data) => {
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetNames = workbook.SheetNames;
      const ExcelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

      ExcelData.forEach((row) => {
        // Buscar y seleccionar el producto
        cy.wait(1000);
        cy.get('#searchInput').clear().type(row.codigo); 
        cy.get('#buttonSubmitCode').click();
        
        cy.wait(1000);

        // Verificar la existencia y visibilidad, luego realizar el dblclick en un bloque then
        cy.get('#touch').first().should('exist').and('be.visible').then(($el) => {
          cy.wrap($el).dblclick();
        });

        if(row.stock > 0) {
          cy.get('#stockSanMartin').then(($input) => {
            const valorActual = $input[0].value;
            console.log('Valor actual de stock San Martin:', valorActual);
            // Ahora puedes hacer algo con el valor actual
            cy.get('#stockSanMartin').clear().type(row.stock);
          });
          
        }

        if(row.precioMayoristaEspecial > 0){
          cy.get('#precioMayoristaEspecial').clear().type(row.precioMayoristaEspecial);
          cy.get('#precioMayoristaPromo').clear().type(row.precioMayoristaEspecial * 0.8);
        }

        if(row.precioMayorista > 0){
          cy.get('#precioMayorista').clear().type(row.precioMayorista);
        }

        if(row.precioMinorista > 0){
          cy.get('#precioMinorista').clear().type(row.precioMinorista); 
          cy.get('#precioMinoristaPromo').clear().type(row.precioMinorista * 0.8);
        }

        if(row.precioSupermercado > 0){
          cy.get('#precioSupermercado').clear().type(row.precioSupermercado); 
        }
        
        if(row.precioMinoristaBolsaAbierta > 0){
          cy.get('#precioMinoristaBolsaAbierta').clear().type(row.precioMinoristaBolsaAbierta); 
        }
        cy.get('#botonAceptar').click();

        cantidadDePreciosActualizados += 1;

        // Verificar la notificación de confirmación y cerrar
        cy.get('.swal2-container').should('be.visible').and('contain', 'Excelente').then(() => {
          cy.get('.swal2-confirm').click();
          cy.wait(1000);
        });
      });

      // Verificar la cantidad de precios actualizados
      cy.wrap(cantidadDePreciosActualizados).should('equal', ExcelData.length);
      // >:(
      
    });
  });
});