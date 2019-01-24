describe('My First Test', function () {
  it('Visits the Kitchen Sink', function () {
    // cy.visit('https://example.cypress.io')//官方文档的例子
    cy.visit('/')
    // cy.pause()// 暂停操作
    // cy.debug()// 强制添加断点
    // cy.contains('type').click()// 查找元素,并追加点击事件
    // // Should be on a new URL which includes '/commands/actions'
    // cy.url().should('include', '/commands/actions')// 在url后续路由是否有/commands/actions
    // // Get an input, type into it and verify that the value has been updated
    // cy.get('.action-email')// 根据css选择器选择一个元素
    //   .type('fake@email.com')// 并通过type方法，在选中的输入文本
    //   .should('have.value', 'fake@email.com')// 通过should验证是否正确，是一种验证特定的事件和结果的一种方式
  })
})
