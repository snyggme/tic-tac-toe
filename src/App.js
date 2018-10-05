import React, { Component } from 'react'
import { Header } from './components/Header'
import { BoardItem } from './components/BoardItem'
import './App.scss'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {   
      playerSign: '',
      turn: 'player',
      isGameActive: false,
      isBtnsActive: true,
      headerText: 'Start game or choose player',
      gameResult: '',
      highlightStyle: {},
      itemsContent: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none']  
    }
    this.winPositions = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]]
    this.corners = [1, 3, 7, 9]
    this.sides = [2, 4, 6, 8]
    this.handleItemClick = this.handleItemClick.bind(this)
    this.pickCrossSign = this.pickCrossSign.bind(this)
    this.pickZeroSign = this.pickZeroSign.bind(this)
    this.resetGame = this.resetGame.bind(this)
    this.handleAnimationEnd = this.handleAnimationEnd.bind(this)
  }
  handleAnimationEnd() {
    const res = document.getElementById('game-results')
    res.style.animation = 'appear 2.2s forwards'

    const whosWin = this.state.gameResult === 'You won!' 
                      ? this.state.playerSign 
                      : this.state.gameResult === 'You lost' 
                        ? this.state.playerSign === 'cross' 
                          ? 'zero' 
                          : 'cross'
                        : 'draw'

    if(whosWin === 'cross') {  
      const el = document.getElementById('cross-small')
      
      el.style.transform = 'scale(3.5)'
      el.style.top = '230px'
      el.style.left = '36%'
      
      res.style.color = 'rgb(242, 235, 211)'
    } 
    else if(whosWin === 'zero') {
      const el = document.getElementById('zero-small')
      
      el.style.transform = 'scale(3.3)'
      el.style.top = '230px'
      el.style.left = '-80%'
      
      res.style.color = 'rgb(84, 84, 84)'
    } 
    else {
      const cross = document.getElementById('cross-small')
      const zero = document.getElementById('zero-small')
      
      cross.style.transform = 'scale(3.5)'
      cross.style.top = '235px'
      cross.style.left = '5%'
      
      zero.style.transform = 'scale(3.3)'
      zero.style.top = '230px'
      zero.style.left = '-20%'
      
      res.style.color = 'rgb(84, 84, 84)'
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.turn !== this.state.turn) {
      const game = this.isWin()     
      if(game.end) {
        this.highlightWin(game.items)
        return
      }
      
      if(this.state.turn === 'computer') {
        setTimeout(() => {
          this.startComputer()
          
          const game = this.isWin()   
          if(game.end) {
            this.highlightWin(game.items)
            return
          }
        }, 500)  
      }
      
      setTimeout(() => {
        this.setState({
          turn: 'player',
          headerText: 'Your turn'
        })
      }, 600)  
    }  
  }
  handleItemClick(e) {
    if(this.state.turn === 'computer' && this.state.playerSign !== '')
      return
    
    const playerSign = this.state.playerSign === '' ? 'cross' : this.state.playerSign.slice()
    const id = e.target.className[e.target.className.length - 1] - 1
    
    if(this.state.itemsContent[id] !== 'none')
      return
    
    const newItemsContent = this.state.itemsContent.map((item, index) => {
      if(item === 'none' && index === id) {
        return playerSign
      } 
      return item
    })       

    this.setState(prevState => ({
      playerSign: playerSign,
      itemsContent: newItemsContent,
      turn: 'computer',
      headerText: 'Computer turn'
    }))   
  }
  pickCrossSign(e) {
    this.setState({
      playerSign: 'cross',
      turn: 'player',
      headerText: 'Your turn'
    })
  }
  pickZeroSign(e) {
    this.setState({
      playerSign: 'zero',
      turn: 'computer',
      headerText: 'Computer turn'
    })
  }
  startComputer() {
    const computerSign = this.state.playerSign === 'cross' ? 'zero' : 'cross'
    this.doComputerTurn(computerSign)
    
    this.setState({
      isBtnsActive: false  
    }) 
  }
  calculateBoardItems(sign, content) {
    return content
      .map((item, index) => {
        if(item === sign)
          return index + 1
        return item
      })
      .filter(item => typeof item === 'number')
  }
  doComputerTurn(sign) {
    const opponentSign = sign === 'cross' ? 'zero' : 'cross'
    
    const createNewContent = (freeItems, who) => {
      return this.state.itemsContent.map((item, index) => {
        if(index === (freeItems[0] - 1))
           return who === 'my' ? sign : opponentSign
        return item
      })
    }
    
    const myBoardItems = this.calculateBoardItems(sign, this.state.itemsContent)
    const freeBoardItems = this.calculateBoardItems('none', this.state.itemsContent)
    const opponentBoardItems = this.calculateBoardItems(opponentSign, this.state.itemsContent) 

    const calculateWinPositions = (boardItems, freeItems) => {
      let items = []
      
      this.winPositions
        .filter(item => {
          let arr = []
          boardItems.map(val => {
            if(item.includes(val))
              arr.push(true)
          })
          return arr.length > 1
        })
        .map(item => {
          item.map(val => {
            if(freeItems.includes(val))
              items.push(val)
          })
        })
      
      return items
    }
    
    const predictWins = (len, who, items) => {
      return items.filter(item => {
        const possibleContent = createNewContent([item], who)

        const freeItems = this.calculateBoardItems('none', possibleContent)
        const boardItems = who === 'my' 
                              ? this.calculateBoardItems(sign, possibleContent) 
                              : this.calculateBoardItems(opponentSign, possibleContent)
        
        const wins = calculateWinPositions(boardItems, freeItems)
        
        return wins.length > len
      })  
    }
    // console.log(predictWins(2, 'my', freeBoardItems))
    
    //************rule 1 start***********
    const myFreeIndexes = calculateWinPositions(myBoardItems, freeBoardItems)
    
    if(myFreeIndexes.length !== 0) {  
      this.setState({
        itemsContent: createNewContent(myFreeIndexes, 'my')
      })
      
      return
    }
    //************rule 1 end***********
    //************rule 2 start***************
    const opponentWinIndexes = calculateWinPositions(opponentBoardItems, freeBoardItems)

    if(opponentWinIndexes.length !== 0) {     
      this.setState({
        itemsContent: createNewContent(opponentWinIndexes, 'my')
      })
      
      return
    }
    //************rule 2 end***************
    //************first move start*********
    const isFirstMove = this.state.itemsContent.every(item => item === 'none')
    if(isFirstMove && sign === 'cross') {
      const newContent = this.state.itemsContent.map((item, index) => {
        if(index === 4)
           return sign
        return item
      })
      
      this.setState({
        itemsContent: newContent
      })
      return
    }
    //************first move end*********
    if(opponentBoardItems.length === 1) {
      const randCorner = this.corners[Math.floor(Math.random() * this.corners.length)]
      
      if(sign === 'zero') { 
        if(this.state.itemsContent[4] === 'none') {
          this.setState({
            itemsContent: createNewContent([5], 'my')
          })
        } else {
          this.setState({
            itemsContent: createNewContent([randCorner], 'my')
          })
        }
        return
      }
      
      if(sign === 'cross') {    
        const fakeWinIndex = calculateWinPositions(opponentBoardItems.concat(myBoardItems), freeBoardItems)
        
        if(this.corners.includes(fakeWinIndex[0])) {
          this.setState({
            itemsContent: createNewContent(fakeWinIndex, 'my')
          }) 
        } else {
          this.setState({
            itemsContent: createNewContent([randCorner], 'my')
          })
        }      
        return
      }
    }
    // we here if rule 2 didnt trigger so do the turn
    if(opponentBoardItems.length === 2) {
      if(sign === 'zero') {
        let randItem = this.sides[Math.floor(Math.random() * this.sides.length)]

        if(!this.corners.includes(opponentBoardItems[0]) || !this.corners.includes(opponentBoardItems[1])) {
          let opponentWins = predictWins(1, 'opponent', freeBoardItems)

          if(opponentWins.length > 1) {
            opponentWins = opponentWins.filter(item => {
              const newFreeItems = this.calculateBoardItems('none', createNewContent([item], 'my'))
              const possibleWinIndex = calculateWinPositions(myBoardItems.concat(item), newFreeItems)
              return possibleWinIndex.length > 0
            })
          }

          randItem = opponentWins[Math.floor(Math.random() * opponentWins.length)]

          if(opponentWins.length === 0) {
            const myWins = predictWins(0, 'my', freeBoardItems)
            randItem = myWins[Math.floor(Math.random() * myWins.length)]
          }
        }
        
        this.setState({
          itemsContent: createNewContent([randItem], 'my')
        }) 
        return
      }
      
      if(sign === 'cross') { 
        const winIndexes = predictWins(1, 'my', freeBoardItems)
        const randItem = winIndexes[Math.floor(Math.random() * winIndexes.length)]
        
        this.setState({
          itemsContent: createNewContent([randItem], 'my')
        })
        return
      }   
    }
    
    if(freeBoardItems.length > 1) {
      const winIndexes = predictWins(0, 'my', freeBoardItems)
      const randItem = winIndexes.length > 0 
                        ? winIndexes[Math.floor(Math.random() * winIndexes.length)] 
                        : freeBoardItems[Math.floor(Math.random() * freeBoardItems.length)] 
        
      this.setState({
        itemsContent: createNewContent([randItem], 'my')
      })
    } else {
      this.setState({
        itemsContent: createNewContent(freeBoardItems, 'my')
      })
    }  
  }
  isWin() {
    const crossItems = this.calculateBoardItems('cross', this.state.itemsContent)
    const zeroItems = this.calculateBoardItems('zero', this.state.itemsContent)
    const freeItems = this.calculateBoardItems('none', this.state.itemsContent)
    
    const calculateWin = (items) => {
      return this.winPositions.filter(item => {
        let arr = []
        items.map(val => {
          if(item.includes(val))
            arr.push(true)
        })
        return arr.length > 2
      })
    }
    
    const crossWin = calculateWin(crossItems)
    
    if(crossWin.length > 0){
      this.setState({
        gameResult: this.state.playerSign === 'cross' ? 'You won!' : 'You lost'
      })
      return {end: true, items: crossWin[0]}
    }
    
    const zeroWin = calculateWin(zeroItems)
    
    if(zeroWin.length > 0) {
      this.setState({
        gameResult: this.state.playerSign === 'zero' ? 'You won!' : 'You lost'
      }) 
      return {end: true, items: zeroWin[0]}
    }
    
    if(freeItems.length === 0) {
      this.setState({
        gameResult: 'It\'s a draw!'
      })
      return {end: true, items: []}
    }
    
    this.setState({
      gameResult: ''
    })    
    return {end: false, items: []}
  }
  highlightWin(items) {
    if(items.length === 0) {
      this.setState({
        highlightStyle: {
          animation: 'win-left-right 0.7s'
        }
      })
      return 
    }
      
    
    const isEqual = (arr1, arr2) => {
      return [...arr1].filter((item, index) => item === arr2[index]).length === arr1.length
    }
  
    const color = this.state.itemsContent[items[0] - 1] === 'cross' ? '#545454' : '#f2ebd3'

    if(isEqual(items, [1, 2, 3])) {
      this.setState({
        highlightStyle: {
          width: '250px',
          height: '5px',
          top: '42px',
          left: '15px',
          backgroundColor: color, 
          animation: 'win-left-right 0.7s'
        }
      })
    }
    else if(isEqual(items, [4, 5, 6])) {
      this.setState({
        highlightStyle: {
          width: '250px',
          height: '5px',
          top: '135px',
          left: '15px',
          backgroundColor: color, 
          animation: 'win-left-right 0.7s'
        }
      })
    }
    else if(isEqual(items, [7, 8, 9])) {
      this.setState({
        highlightStyle: {
          width: '250px',
          height: '5px',
          top: '229px',
          left: '15px',
          backgroundColor: color, 
          animation: 'win-left-right 0.7s'
        }
      })
    }  
    else if(isEqual(items, [1, 4, 7])) {
      this.setState({
        highlightStyle: {
          width: '5px',
          height: '250px',
          top: '14px',
          left: '42px',
          backgroundColor: color, 
          animation: 'win-top-bottom 0.7s'
        }
      })
    }
    else if(isEqual(items, [2, 5, 8])) {
      this.setState({
        highlightStyle: {
          width: '5px',
          height: '250px',
          top: '14px',
          left: '135px',
          backgroundColor: color, 
          animation: 'win-top-bottom 0.7s'
        }
      })
    }
    else if(isEqual(items, [3, 6, 9])) {
      this.setState({
        highlightStyle: {
          width: '5px',
          height: '250px',
          top: '14px',
          left: '230px',
          backgroundColor: color, 
          animation: 'win-top-bottom 0.7s'
        }
      })
    }
    else if(isEqual(items, [1, 5, 9])) {
      this.setState({
        highlightStyle: {
          width: '300px',
          height: '7px',
          top: '146px',
          backgroundColor: color,
          animation: 'win-diag-159 0.7s forwards'
        }
      })
    }
    else if(isEqual(items, [3, 5, 7])) {
      this.setState({
        highlightStyle: {
          width: '300px',
          height: '7px',
          top: '123px',
          backgroundColor: color,
          animation: 'win-diag-357 0.7s forwards'
        }
      })
    }
  }
  resetGame() {
    const cross = document.getElementById('cross-small')
    cross.style.transform = 'scale(1)'
    cross.style.top = '0'
    cross.style.left = '0'

    const zero = document.getElementById('zero-small')
    zero.style.transform = 'scale(1)'
    zero.style.top = '0'
    zero.style.left = '0'
    
    this.setState({
      playerSign: '',
      isGameActive: false,
      isBtnsActive: true,
      headerText: 'Start game or choose player',
      gameResult: '',
      turn: 'player',
      highlightStyle: {},
      itemsContent: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none']
    })
    
    document.getElementById('game-results').style.animation = 'initial'
  }
  render() {
    let crossActive = false
    let zeroActive = false
    
    if (this.state.playerSign === 'cross') {
      crossActive = this.state.turn === 'player'
      zeroActive = this.state.turn === 'computer'
    } 
    else if (this.state.playerSign === 'zero') {
      crossActive = this.state.turn === 'computer'
      zeroActive = this.state.turn === 'player'
    }
    
    return(
      <div className='container'>
        <Header active={this.state.isBtnsActive}
                crossActive={crossActive}
                zeroActive={zeroActive}
                pickZeroSign={this.pickZeroSign}
                pickCrossSign={this.pickCrossSign}
                text={this.state.headerText}/>
        <div>
          {this.state.gameResult === '' ? '' : <div id='game-results'>{this.state.gameResult === 'It\'s a draw!' ? 'DRAW!' : 'WON!'}</div>}
          <div id='game-board' style={this.state.gameResult === '' ? {animation: 'initial'} : {animation: 'blur 2s forwards'}}>
            {this.state.gameResult === '' ? '' : <div id='highlight' onAnimationEnd={this.handleAnimationEnd} style={this.state.highlightStyle}></div>}
            <BoardItem name='item-1' content={this.state.itemsContent[0]} onClick={this.handleItemClick}/>
            <BoardItem name='item-2' content={this.state.itemsContent[1]} onClick={this.handleItemClick}/>
            <BoardItem name='item-3' content={this.state.itemsContent[2]} onClick={this.handleItemClick}/>
            <BoardItem name='item-4' content={this.state.itemsContent[3]} onClick={this.handleItemClick}/>
            <BoardItem name='item-5' content={this.state.itemsContent[4]} onClick={this.handleItemClick}/>
            <BoardItem name='item-6' content={this.state.itemsContent[5]} onClick={this.handleItemClick}/>
            <BoardItem name='item-7' content={this.state.itemsContent[6]} onClick={this.handleItemClick}/>
            <BoardItem name='item-8' content={this.state.itemsContent[7]} onClick={this.handleItemClick}/>
            <BoardItem name='item-9' content={this.state.itemsContent[8]} onClick={this.handleItemClick}/>
          </div>
        </div>
        <div className='reset-game' onClick={this.resetGame}>RESET GAME</div>
      </div>
    )
  }
}

export default App;